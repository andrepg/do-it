/* task-list-store.ts
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
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { useTaskSort } from '~/hooks/tasks.sort.js';

import { ActionNames, AppSignals } from '../enums.js';
import { ITask } from '../../../app.types.js';

import { log } from '../../../utils/log-manager.js';
import { FilePersistence } from '../../../core/persistence/file-persistence.js';

import { TaskItem } from './task-item.js';
import { DoItMainWindow } from './doit.js';

const TaskListStoreType = {
  GTypeName: 'TaskListStore',
  Signals: {
    [AppSignals.TaskUpdated]: {
      param_types: [GObject.TYPE_OBJECT],
    },
    [AppSignals.TaskDeleted]: {
      param_types: [GObject.TYPE_OBJECT],
    },
  },
};

/**
 * A global list store containing all TaskItem instances.
 *
 * Inherits from Gio.ListStore. It handles sorting, persisting task changes to disk,
 * and maintaining the comprehensive list of tasks for the application state.
 */
export class TaskListStore extends Gio.ListStore<TaskItem> {
  static {
    GObject.registerClass(TaskListStoreType, this);
  }

  private persistence = new FilePersistence();
  private task_sort = useTaskSort();

  /**
   * Retrieves all tasks current loaded in the internal store as plain serializable objects.
   */
  get_all(): ITask[] {
    const tasks: ITask[] = [];

    for (let index = 0; index < this.get_count(); index++) {
      const item = this.get_item(index);
      if (item instanceof TaskItem) {
        tasks.push(item.to_object());
      }
    }

    return tasks;
  }

  /**
   * Finds a specific TaskItem by its unique identifier.
   *
   * @param id The task ID to look for.
   * @returns The matching TaskItem or null if not found.
   */
  find_by_id(id: string): TaskItem | null {
    for (let index = 0; index < this.get_count(); index++) {
      const item = this.get_item(index);
      if (item instanceof TaskItem && item.to_object().id === id) {
        return item;
      }
    }

    return null;
  }

  /**
   * Returns the total amount of tasks tracked in the store.
   */
  get_count(): number {
    return this.get_n_items();
  }

  /**
   * Instantiates and registers a new TaskItem into the list store.
   *
   * @param data Raw initialization data for the new task.
   */
  append_task(data: ITask) {
    const taskId = data.id !== undefined ? String(data.id) : GLib.uuid_string_random();

    const task = new TaskItem(
      taskId,
      data.title,
      data.done,
      data.created_at,
      data.project,
      data.deleted,
    );

    const _update_interface = (signal: string) => {
      log('list-store', `Received ${signal} signal.`);

      GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
        const prefs = this.task_sort.retrieve_sort_preferences();
        this.task_sort.persist_sort_preferences(prefs.mode, prefs.strategy);
        this.sort_list();
        this.persist_store();
        return GLib.SOURCE_REMOVE;
      });
    };

    task.connect(AppSignals.TaskUpdated, () => {
      _update_interface(AppSignals.TaskUpdated);
      this.emit(AppSignals.TaskUpdated, task);
    });
    task.connect(AppSignals.TaskDeleted, () => {
      _update_interface(AppSignals.TaskDeleted);
      this.emit(AppSignals.TaskDeleted, task);
    });

    task.connect(AppSignals.Activated, () => {
      const root = task.get_root() as DoItMainWindow;
      if (root && root.activate_action) {
        root.activate_action(
          ActionNames.TaskEdit,
          new GLib.Variant('s', task.to_object().id as string),
        );
      }
    });

    const { mode, strategy } = this.task_sort.retrieve_sort_preferences();
    this.insert_sorted(task, this.task_sort.sort_by(mode, strategy));
  }

  /**
   * Forces the list store to perform an internal sort based on global preferences.
   */
  sort_list() {
    const { mode, strategy } = this.task_sort.retrieve_sort_preferences();

    this.sort(this.task_sort.sort_by(mode, strategy));
  }

  /**
   * Erases all logically soft-deleted entries from the database, reloading the state afterwards.
   */
  purge_deleted() {
    log('list-store', 'Purging deleted entries');

    this.persist_store(false);
    this.remove_all();
    this.load();
  }

  /**
   * Triggers a rewrite of the current state of tasks to the local JSON database file.
   *
   * @param keep_deleted If false, soft-deleted elements will not be saved (causing removal).
   */
  persist_store(keep_deleted = true) {
    log('list-store', 'Saving tasks to database');
    const tasks = this.get_all().filter((item) => (keep_deleted ? true : !item.deleted));

    this.persistence.save(tasks);
  }

  /**
   * Removes a single item from the list store, using the ID as comparison to find
   * which task we need to delete.
   */
  remove_task(id: string) {
    const task = this.find_by_id(id);

    if (!task) return;

    const [found, position] = this.find(task);

    if (!found) return;

    this.remove(position);
  }

  /**
   * Initializes the application state, reading tasks from the disk and appending them to the store.
   */
  async load() {
    log('list-store', 'Loading tasks from database');

    const tasks = await this.persistence.load();

    tasks.forEach((item) => {
      log('list-store', `Loading task ${item.title}`);
      this.append_task(item);
    });
  }
}
