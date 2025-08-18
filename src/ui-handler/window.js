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

const { GObject, Adw, Gio } = imports.gi;

import { Persistence } from "../utils/persistence.js";
import { TaskList } from "./task-list.js";

export const TasksWindow = GObject.registerClass(
  {
    GTypeName: "TasksWindow",
    Template: "resource:///io/github/andrepg/Doit/ui/window.ui",
    InternalChildren: ["task_new_entry", "toast_overlay", "list_flow_box"],
  },
  class TasksWindow extends Adw.ApplicationWindow {
    /**
     * Store to hold pending tasks
     * @type {TaskList}
     * @private
     */
    _pending_task_list;

    /**
     * Stores the list of tasks that have been completed.
     * @type {TaskList}
     * @private
     */
    _finished_task_list;

    constructor(application) {
      super({ application });

      // Connect our main New Task button event with task creation
      this._task_new_entry.connect("activate", this._createTask.bind(this));

      this._setup_pending_task_list();
      this._setup_finished_task_list();

      this._load_tasks_from_database();
    }

    _load_tasks_from_database() {
      const tasks = new Persistence().readFromFile();

      tasks.forEach((task) => {
        if (task.done) {
          this._finished_task_list.add_task(task);
          return;
        }

        this._pending_task_list.add_task(task);
      });
    }

    _save_tasks_to_database() {
      const tasks = [];

      tasks.push(...this._pending_task_list.get_list().get_all());
      tasks.push(...this._finished_task_list.get_list().get_all());

      new Persistence().saveToFile(tasks);
    }

    _setup_pending_task_list() {
      this._pending_task_list = new TaskList(
        "💪 Pending",
        "All you need to accomplish in your workflow",
      );
      this._pending_task_list.connect("items-changed", () => {});

      let pending_clamp = new Adw.Clamp();
      pending_clamp.set_maximum_size(960);
      pending_clamp.set_child(this._pending_task_list);

      this._list_flow_box.append(pending_clamp);
    }

    _setup_finished_task_list() {
      this._finished_task_list = new TaskList(
        "✅ Finished",
        "You already master all these tasks!",
      );
      this._finished_task_list.connect("items-changed", () => {});

      let finished_clamp = new Adw.Clamp();
      finished_clamp.set_maximum_size(960);
      finished_clamp.set_child(this._finished_task_list);

      this._list_flow_box.append(finished_clamp);
    }

    /**
     * Add a new task to pending store and persist on disk
     */
    _createTask() {
      const title = this._task_new_entry.get_text();

      if (title.trim() == "") return;

      console.log("[window] Ask Pending list to add new task");
      this._pending_task_list.add_task({ title: title.trim() });

      console.log("[window] Cleaning up interface and inputs");
      this._task_new_entry.set_text("");

      console.log("[window] Dispatching user feedback");
      this.display_toast(
        new Adw.Toast({ title: `Task "${title.trim()}" created` }),
      );

      this._save_tasks_to_database();
    }

    display_toast(toast) {
      this._toast_overlay.add_toast(toast);
    }
  },
);
