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
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { AppSignals, WidgetIds } from '~/app.enums.js';
import type { ProjectGroupEntry } from '~/app.types.js';

import { Task } from '~/models/task.js';
import { TaskItem } from './task-item.js';
import { ProjectGroup } from './project-group.js';
import { TaskListStore } from '../store/list-store.js';
import { collect_project_groups } from '~/utils/task-grouping.js';
import { order_projects } from '~/utils/tasks.sort.js';

const TaskListType = {
  GTypeName: 'TaskList',
  Signals: {
    [AppSignals.TaskActivated]: { param_types: [GObject.TYPE_OBJECT] },
    [AppSignals.TaskUpdated]: { param_types: [GObject.TYPE_OBJECT] },
    [AppSignals.TaskDeleted]: { param_types: [GObject.TYPE_OBJECT] },
  },
};

/**
 * Dynamically renders the global task list as one ProjectGroup per project.
 *
 * Hierarchy: DoItMainWindow (Main view list_stack) -> [list_empty | list_container -> TaskList -> ProjectGroup(s) -> TaskItem(s)]
 *
 * Instead of binding a filtered model per project, it walks the TaskListStore
 * in a single pass, groups tasks by their project and syncs one ProjectGroup
 * per project into the given PreferencesPage. TaskItem widgets are cached and
 * reused across rebuilds; group rendering itself is delegated to ProjectGroup.
 *
 * It also owns the switch between the task list and the empty state page,
 * based on whether the store holds any tasks.
 *
 * Signals: row interactions bubble up as TaskUpdated/TaskDeleted (also
 * forwarded to the store), and row activation fires TaskActivated. Side
 * effects like opening the edit form or showing toasts belong to listeners
 * (the actions layer), never to this widget.
 */
export class TaskList extends GObject.Object {
  static {
    GObject.registerClass(TaskListType, this);
  }

  private store = TaskListStore.get_default();
  private container: Adw.PreferencesPage;
  private stack: Gtk.Stack;
  private groups: Map<string, ProjectGroup> = new Map();
  private widgetCache: Map<Task, TaskItem> = new Map();
  private currentFilter: string | null = null;
  private _rebuild_queued = false;

  /**
   * @constructor
   * @param {Adw.PreferencesPage} container - The page that will hold the generated groups
   * @param {Gtk.Stack} stack - The stack toggling between the task list and the empty state
   */
  constructor(container: Adw.PreferencesPage, stack: Gtk.Stack) {
    super();

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

    for (const projectGroup of this.groups.values()) {
      projectGroup.apply_filter(project);
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
   * Syncs the project groups from the current store state in a single pass.
   */
  private rebuild(): void {
    const tasks = this.get_store_tasks();

    const projectGroupList = collect_project_groups(tasks);
    const orderedProjects = order_projects(projectGroupList);

    this.prune_widget_cache(tasks);
    this.sync_groups(orderedProjects, projectGroupList);
  }

  /**
   * Collects all tasks currently held by the store.
   */
  private get_store_tasks(): Task[] {
    const tasks: Task[] = [];

    for (let i = 0; i < this.store.get_count(); i++) {
      tasks.push(this.store.get_item(i) as Task);
    }

    return tasks;
  }

  /**
   * Removes cached TaskItem widgets for Tasks no longer in the store.
   * @param storeTasks The tasks currently held by the store.
   */
  private prune_widget_cache(storeTasks: Task[]): void {
    const liveTasks = new Set(storeTasks);

    for (const [task] of this.widgetCache) {
      if (!liveTasks.has(task)) {
        this.widgetCache.delete(task);
      }
    }
  }

  /**
   * Retrieves or creates a TaskItem widget for the given Task.
   * TaskItem signals are wired to the store on first creation.
   */
  private get_or_create_widget(task: Task): TaskItem {
    const cached = this.widgetCache.get(task);
    if (cached) return cached;

    const taskItem = new TaskItem(task);

    taskItem.connect(AppSignals.TaskUpdated, () =>
      this.forward_row_signal(AppSignals.TaskUpdated, task),
    );

    taskItem.connect(AppSignals.TaskDeleted, () =>
      this.forward_row_signal(AppSignals.TaskDeleted, task),
    );

    taskItem.connect(AppSignals.Activated, () => this.emit(AppSignals.TaskActivated, task));

    this.widgetCache.set(task, taskItem);

    return taskItem;
  }

  /**
   * Bubbles a row signal to this widget's listeners and forwards it to
   * the store, which re-emits, sorts and persists.
   * @param signal The bubbling signal name.
   * @param task The task the signal originated from.
   */
  private forward_row_signal(signal: AppSignals, task: Task): void {
    this.emit(signal, task);

    this.store.on_task_changed(signal, task);
  }

  /**
   * Ensures one ProjectGroup exists per ordered project, re-rendering its
   * rows and visibility, then re-appends every group in order and prunes
   * groups with no remaining tasks.
   * @param orderedProjects The ordered project names.
   * @param projectGroupList The collected project groups.
   */
  private sync_groups(
    orderedProjects: string[],
    projectGroupList: Map<string, ProjectGroupEntry>,
  ): void {
    const seenProjects = new Set<string>();

    for (const projectName of orderedProjects) {
      const projectEntry = projectGroupList.get(projectName);
      if (!projectEntry) continue;

      const projectGroup = this.ensure_project_group(projectName);

      projectGroup.render(projectEntry, (task) => this.get_or_create_widget(task));
      projectGroup.apply_filter(this.currentFilter);

      seenProjects.add(projectName);
    }

    this.reorder_groups(orderedProjects);
    this.prune_missing_groups(seenProjects);
  }

  /**
   * Creates or retrieves the cached ProjectGroup for the given project.
   * @param projectName The project name.
   * @returns The matching ProjectGroup wrapper.
   */
  private ensure_project_group(projectName: string): ProjectGroup {
    let projectGroup = this.groups.get(projectName);

    if (!projectGroup) {
      projectGroup = new ProjectGroup(projectName);
      this.groups.set(projectName, projectGroup);
    }

    return projectGroup;
  }

  /**
   * Re-appends every group widget to the page in the desired order.
   * @param orderedProjects The desired project order.
   */
  private reorder_groups(orderedProjects: string[]): void {
    for (const projectName of orderedProjects) {
      const projectGroup = this.groups.get(projectName);
      if (!projectGroup) continue;

      this.container.remove(projectGroup.widget);
      this.container.add(projectGroup.widget);
    }
  }

  /**
   * Drops cached groups whose project no longer has any tasks.
   * @param seenProjects The projects that survived this rebuild.
   */
  private prune_missing_groups(seenProjects: Set<string>): void {
    for (const [projectName, projectGroup] of this.groups) {
      if (!seenProjects.has(projectName)) {
        this.container.remove(projectGroup.widget);
        this.groups.delete(projectName);
      }
    }
  }
}
