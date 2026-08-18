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
import Gtk from 'gi://Gtk';

import { AppSignals, WidgetIds } from '~/app.enums.js';
import { AppLocale } from '~/app.strings.js';

import { Task } from '~/models/task.js';
import { TaskItem } from './task-item.js';
import { TaskListStore } from '../store/list-store.js';
import {
  ProjectGroupEntry,
  collect_project_groups,
  is_group_visible,
} from '~/utils/task-grouping.js';
import { order_projects } from '~/utils/tasks.sort.js';

/**
 * Dynamically renders the global task list as one Adw.PreferencesGroup per project.
 *
 * Hierarchy: DoItMainWindow (Main view list_stack) -> [list_empty | list_container -> PreferencesGroup(s) -> TaskItem(s)]
 *
 * Instead of binding a filtered model per project, it walks the TaskListStore
 * in a single pass, groups tasks by their project and builds one
 * Adw.PreferencesGroup per project directly into the given PreferencesPage.
 * TaskItem rows are added straight to the groups, so no Gtk.ListBox or
 * Gtk.CustomFilter is needed. It also owns the switch between the task list
 * and the empty state page, based on whether the store holds any tasks.
 */
export class TaskList {
  private store = TaskListStore.get_default();
  private container: Adw.PreferencesPage;
  private stack: Gtk.Stack;
  private projectGroups: Map<string, Adw.PreferencesGroup> = new Map();
  private groupRows: Map<Adw.PreferencesGroup, TaskItem[]> = new Map();
  private widgetCache: Map<Task, TaskItem> = new Map();
  private currentFilter: string | null = null;
  private lastGroupOrder: string[] = [];
  private _rebuild_queued = false;

  /**
   * @constructor
   * @param {Adw.PreferencesPage} container - The page that will hold the generated groups
   * @param {Gtk.Stack} stack - The stack toggling between the task list and the empty state
   */
  constructor(container: Adw.PreferencesPage, stack: Gtk.Stack) {
    this.container = container;
    this.stack = stack;

    this.store.connect(AppSignals.ItemsChanged, () => this.on_store_changed());
    this.store.connect(AppSignals.TaskUpdated, () => this.on_store_changed());
    this.store.connect(AppSignals.TaskDeleted, () => this.on_store_changed());

    this.update_empty_state();
    this.rebuild();
  }

  /**
   * Reacts to store changes by toggling the empty state and queuing a rebuild.
   */
  private on_store_changed(): void {
    this.update_empty_state();
    this.schedule_rebuild();
  }

  /**
   * Switches the stack to the empty state page when no tasks are present,
   * and back to the task list otherwise.
   */
  private update_empty_state(): void {
    this.stack.set_visible_child_name(
      this.store.get_count() > 0 ? WidgetIds.WindowListContainer : WidgetIds.WindowListEmpty,
    );
  }

  /**
   * Sets the active project filter, showing only the matching group.
   * @param project The project name to show, or null to show all groups.
   */
  public set_filter(project: string | null): void {
    this.currentFilter = project;

    for (const [projectName, preferencesGroup] of this.projectGroups) {
      preferencesGroup.set_visible(is_group_visible(projectName, project));
    }
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
    const tasks: Task[] = [];

    for (let i = 0; i < this.store.get_count(); i++) {
      tasks.push(this.store.get_item(i) as Task);
    }

    const projectGroupList = collect_project_groups(tasks);
    const orderedProjects = order_projects(projectGroupList);

    this.detach_all_rows();
    this.prune_widget_cache();

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
   * Removes cached TaskItem widgets for Tasks no longer in the store.
   */
  private prune_widget_cache(): void {
    const storeTasks = new Set<Task>();

    for (let i = 0; i < this.store.get_count(); i++) {
      storeTasks.add(this.store.get_item(i) as Task);
    }

    for (const [task] of this.widgetCache) {
      if (!storeTasks.has(task)) {
        this.widgetCache.delete(task);
      }
    }
  }

  /**
   * Retrieves or creates a TaskItem widget for the given Task.
   * TaskItem signals are wired to the store on first creation.
   */
  private get_or_create_widget(task: Task): TaskItem {
    let taskItem = this.widgetCache.get(task);

    if (!taskItem) {
      taskItem = new TaskItem(task);

      taskItem.connect(AppSignals.TaskUpdated, () =>
        this.store.on_task_changed(AppSignals.TaskUpdated, task),
      );

      taskItem.connect(AppSignals.TaskDeleted, () =>
        this.store.on_task_changed(AppSignals.TaskDeleted, task),
      );

      this.widgetCache.set(task, taskItem);
    }

    return taskItem;
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

      preferencesGroup.set_visible(is_group_visible(projectName, this.currentFilter));
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
    const rows: TaskItem[] = [];

    for (const task of projectGroup.tasks) {
      const taskItem = this.get_or_create_widget(task);
      preferencesGroup.add(taskItem);
      rows.push(taskItem);
    }

    this.groupRows.set(preferencesGroup, rows);

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
