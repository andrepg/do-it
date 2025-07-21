/* window.js
 *
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
import Adw from 'gi://Adw';

import { Task } from "./js/task.js"
import { Persistence } from './js/persistence.js';

export const TasksWindow = GObject.registerClass({
  GTypeName: 'TasksWindow',
  Template: 'resource:///br/dev/startap/tasks/ui/window.ui',
  InternalChildren: [
    "list_box_pending",
    "list_box_finished",
    "main_window",
    "task_new_entry",
    "task_new_button"
  ],
}, class TasksWindow extends Adw.ApplicationWindow {
  constructor(application) {
    super({ application });

    this._initializeTasks();

    this._task_new_button.connect('clicked', this._addTask.bind(this))

    this._list_box_pending.bind_model(
      this.taskStorePending,
      (task) => task.to_widget()
    );

    this._list_box_finished.bind_model(
      this.taskStoreFinished,
      (task) => task.to_widget()
    );
  }

  /**
  * Initialize our tasks lists, both pending and finished
  * from data returned from persistence class
  */
  _initializeTasks() {
    this.persistence = new Persistence();
    this.taskStorePending = new Gio.ListStore({ item_type: Task });
    this.taskStoreFinished = new Gio.ListStore({ item_type: Task });

    for (let item of this.persistence.readFromFile()) {
      const task = new Task(item.taskId, item.title, item.done);
      this._attachTaskEvents(task);
      if (task._done) {
        this.taskStoreFinished.append(task)
      } else {
        this.taskStorePending.append(task)
      }
    }
  }

  /**
    * Attach task events to handle update and deletion from each task
    */
  _attachTaskEvents(task) {
    task.connect('task-updated', this._updateTask.bind(this));
    task.connect('task-deleted', this._deleteRow.bind(this));
  }

  /**
    * Add a new task to pending store and persist on disk
    */
  _addTask() {
    const task = new Task(
      this.taskStorePending.n_items + 1,
      this._task_new_entry.get_text()
    );

    this._attachTaskEvents(task);

    this.taskStorePending.append(task);

    this._saveDatabase();

    this._task_new_entry.set_text("");

    // TODO Here we can fire a Toast
  }

  /**
    * Update a single task, change store position (when marked as done)
    * and calls persistence to save user data
    */
  _updateTask(task) {
    const [found_pending, position_pending] = this.taskStorePending.find(task);
    const [found_finished, position_finished] = this.taskStoreFinished.find(task);

    if (task._done && found_pending) {
      this.taskStorePending.remove(position_pending);
      this.taskStoreFinished.append(task);
    }

    if (!task._done && found_finished) {
      this.taskStoreFinished.remove(position_finished);
      this.taskStorePending.append(task);
    }

    this._saveDatabase();
  }

  /**
    * Delete a row from list store, depending on current
    * task status
    */
  _deleteRow(task) {
    let [found, position] = this.taskStorePending.find(task);

    if (task._done) {
      [found, position] = this.taskStoreFinished.find(task);
    }

    if (found && task._done) {
      this.taskStoreFinished.remove(position);
    }

    if (found && !task._done) {
      this.taskStorePending.remove(position);
    }

    // TODO Here we can fire a Toast
    this._saveDatabase();
  }

  /**
    * Save current database in user folder, persisting our information
    */
  _saveDatabase() {
    const finished_count = this.taskStoreFinished.n_items;
    const pending_count = this.taskStorePending.n_items;

    const tasks = [];

    for (let i = 0; i < finished_count; i++) {
      const task = this.taskStoreFinished.get_item(i).to_object()
      tasks.push(task);
    }

    for (let i = 0; i < pending_count; i++) {
      const task = this.taskStorePending.get_item(i).to_object()
      tasks.push(task);
    }

    this.persistence.saveToFile(tasks);
  }

});

