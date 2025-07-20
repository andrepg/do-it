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
    "task_new_entry",
    "task_new_button"
  ],
}, class TasksWindow extends Adw.ApplicationWindow {
  taskStore;

  constructor(application) {
    super({ application });

    this.persistence = new Persistence();
    this.taskStore = new Gio.ListStore({ item_type: Task });

    this._initializeTasks();

    this._task_new_button.connect('clicked', this._addTask.bind(this))

    this._list_box_pending.bind_model(
      this.taskStore,
      (task) => task.to_widget()
    );
  }

  _initializeTasks() {
    for (let task of this.persistence.readFromFile()) {
      this.taskStore.append(new Task(task.taskId, task.title, task.done))
    }
  }

  _addTask() {
    const task = new Task(
      this.taskStore.n_items + 1,
      this._task_new_entry.get_text()
    );

    task.connect('task-updated', () => this._saveDatabase());
    task.connect('task-deleted', this._deleteRow.bind(this));

    this.taskStore.append(task);

    this._saveDatabase();

    this._task_new_entry.set_text("");

    // TODO Here we can fire a Toast
  }

  _deleteRow(task) {
    const [found, position] = this.taskStore.find(task);

    if (found) {
      this.taskStore.remove(position);

      this._saveDatabase();
    }
  }

  async _saveDatabase() {
    const list_count = this.taskStore.n_items;

    const tasks = [];

    for (let i = 0; i < list_count; i++) {
      const task = this.taskStore.get_item(i).to_object()
      tasks.push(task);
    }

    this.persistence.saveToFile(tasks);
  }
});

