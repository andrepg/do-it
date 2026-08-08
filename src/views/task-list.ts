/* task-list.ts
 * Copyright 2025 André Paul Grandsire
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';

import { AppSignals } from '~/app.enums.js';
import { AppLocale } from '~/app.strings.js';
import { MagicFilters } from '~/static/sidebar.js';

import { TaskItem } from './task-item.js';
import { TaskListStore } from '../store/list-store.js';

/**
 * A single project's collected tasks and their status counters.
 */
interface ProjectGroupEntry {
  tasks: TaskItem[];
  finished: number;
  deleted: number;
}

/**
 * Dynamically renders the global task list as one Adw.PreferencesGroup per project.
 *
 * Hierarchy: DoItMainWindow (Main view list_container) -> PreferencesGroup(s) -> TaskItem(s)
 *
 * Instead of binding a filtered model per project, it walks the TaskListStore
 * in a single pass, groups tasks by their project and builds one
 * Adw.PreferencesGroup per project directly into the given PreferencesPage.
 * TaskItem rows are added straight to the groups, so no Gtk.ListBox or
 * Gtk.CustomFilter is needed.
 */
export class TaskList {
  private store = TaskListStore.get_default();
  private container: Adw.PreferencesPage;
  private projectGroups: Map<string, Adw.PreferencesGroup> = new Map();
  private groupRows: Map<Adw.PreferencesGroup, TaskItem[]> = new Map();
  private currentFilter: string | null = null;
  private lastGroupOrder: string[] = [];
  private _rebuild_queued = false;

  /**
   * @constructor
   * @param {Adw.PreferencesPage} container - The page that will hold the generated groups
   */
  constructor(container: Adw.PreferencesPage) {
    this.container = container;

    this.store.connect(AppSignals.ItemsChanged, () => this.schedule_rebuild());
    this.store.connect(AppSignals.TaskUpdated, () => this.schedule_rebuild());
    this.store.connect(AppSignals.TaskDeleted, () => this.schedule_rebuild());

    this.rebuild();
  }

  /**
   * Sets the active project filter, showing only the matching group.
   * @param project The project name to show, or null to show all groups.
   */
  public set_filter(project: string | null): void {
    this.currentFilter = project;

    for (const [projectName, preferencesGroup] of this.projectGroups) {
      preferencesGroup.set_visible(this.is_group_visible(projectName, project));
    }
  }

  /**
   * Returns whether the given project group should be visible under the
   * current filter, honoring the magic filters for all and none.
   *
   * @param projectName The project name of the group.
   * @param filter The active project filter.
   */
  private is_group_visible(projectName: string, filter: string | null): boolean {
    if (filter === MagicFilters.all || filter === null) return true;
    if (filter === MagicFilters.none) return projectName === '';

    return projectName === filter;
  }

  /**
   * Queues a rebuild on the next idle cycle, collapsing bursts of store signals.
   */
  private schedule_rebuild(): void {
    if (this._rebuild_queued) return;
    this._rebuild_queued = true;

    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.rebuild();
      this._rebuild_queued = false;
      return GLib.SOURCE_REMOVE;
    });
  }

  /**
   * Rebuilds the project groups from the current store state in a single pass.
   */
  private rebuild(): void {
    const projectGroupList = this.collect_project_groups();
    const orderedProjects = this.order_projects(projectGroupList);

    this.detach_all_rows();

    this.reconcile_groups(orderedProjects, projectGroupList);
  }

  /**
   * Detaches every cached row from its group before rows are re-added.
   *
   * Rows live in the group's internal GtkListBox and cannot be enumerated
   * from the group itself, so previously added rows are tracked and removed
   * through the group API. This also unparents tasks that moved to another
   * project regardless of the order in which groups are rebuilt.
   */
  private detach_all_rows(): void {
    for (const [preferencesGroup, rows] of this.groupRows) {
      for (const row of rows) {
        preferencesGroup.remove(row);
      }
    }

    this.groupRows.clear();
  }

  /**
   * Groups all store tasks by project, counting finished/deleted per project.
   * @returns A map of project name to its collected tasks and counters.
   */
  private collect_project_groups(): Map<string, ProjectGroupEntry> {
    const projectGroupList = new Map<string, ProjectGroupEntry>();

    for (let i = 0; i < this.store.get_count(); i++) {
      const item = this.store.get_item(i);
      if (!(item instanceof TaskItem)) continue;

      let projectGroup = projectGroupList.get(item.project);
      if (!projectGroup) {
        projectGroup = { tasks: [], finished: 0, deleted: 0 };
        projectGroupList.set(item.project, projectGroup);
      }

      projectGroup.tasks.push(item);
      if (item.done) projectGroup.finished++;
      if (item.deleted) projectGroup.deleted++;
    }

    return projectGroupList;
  }

  /**
   * Orders the project names alphabetically.
   * @param projectGroupList The collected project groups.
   * @returns The ordered list of project names.
   */
  private order_projects(projectGroupList: Map<string, ProjectGroupEntry>): string[] {
    return Array.from(projectGroupList.keys()).sort((a, b) => {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });
  }

  /**
   * Ensures one PreferencesGroup exists per ordered project, refreshing its
   * rows and description, then prunes groups with no remaining tasks.
   * @param orderedProjects The ordered project names.
   * @param projectGroupList The collected project groups.
   */
  private reconcile_groups(
    orderedProjects: string[],
    projectGroupList: Map<string, ProjectGroupEntry>,
  ): void {
    const visibleProjects = new Set<string>();

    for (const projectName of orderedProjects) {
      const projectGroup = projectGroupList.get(projectName);
      if (!projectGroup) continue;

      const preferencesGroup = this.ensure_preferences_group(projectName);
      visibleProjects.add(projectName);

      this.refresh_preferences_group(preferencesGroup, projectGroup);

      preferencesGroup.set_visible(this.is_group_visible(projectName, this.currentFilter));
    }

    this.reorder_groups(orderedProjects);
    this.prune_missing_groups(visibleProjects);
  }

  /**
   * Creates or retrieves the cached PreferencesGroup for the given project.
   * @param projectName The project name.
   * @returns The matching PreferencesGroup widget.
   */
  private ensure_preferences_group(projectName: string): Adw.PreferencesGroup {
    let preferencesGroup = this.projectGroups.get(projectName);

    if (!preferencesGroup) {
      preferencesGroup = new Adw.PreferencesGroup({
        title: projectName === '' ? AppLocale.tasks.list.noProject : projectName,
      });

      this.projectGroups.set(projectName, preferencesGroup);
      this.container.add(preferencesGroup);
    }

    return preferencesGroup;
  }

  /**
   * Refreshes a group's rows (re-adding tasks in store order) and its description.
   * @param preferencesGroup The group widget to refresh.
   * @param projectGroup The collected tasks and counters for the group.
   */
  private refresh_preferences_group(
    preferencesGroup: Adw.PreferencesGroup,
    projectGroup: ProjectGroupEntry,
  ): void {
    for (const task of projectGroup.tasks) {
      preferencesGroup.add(task);
    }

    this.groupRows.set(preferencesGroup, [...projectGroup.tasks]);

    preferencesGroup.set_description(
      AppLocale.tasks.list.groupDescription.format(projectGroup.finished, projectGroup.deleted),
    );
  }

  /**
   * Re-appends the groups in the desired order, but only when that order changed.
   * @param orderedProjects The desired project order.
   */
  private reorder_groups(orderedProjects: string[]): void {
    if (orderedProjects.join('|') === this.lastGroupOrder.join('|')) return;

    this.lastGroupOrder = [...orderedProjects];

    for (const projectName of orderedProjects) {
      const preferencesGroup = this.projectGroups.get(projectName);
      if (preferencesGroup) {
        this.container.remove(preferencesGroup);
        this.container.add(preferencesGroup);
      }
    }
  }

  /**
   * Removes cached groups whose project no longer has any tasks.
   * @param visibleProjects The projects that survived this rebuild.
   */
  private prune_missing_groups(visibleProjects: Set<string>): void {
    for (const [projectName, preferencesGroup] of this.projectGroups) {
      if (!visibleProjects.has(projectName)) {
        this.container.remove(preferencesGroup);
        this.groupRows.delete(preferencesGroup);
        this.projectGroups.delete(projectName);
      }
    }
  }
}
