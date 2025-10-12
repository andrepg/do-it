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

const { GObject, Adw } = imports.gi;

import { TaskListStore } from "../utils/list-store.js";
import { CreateTaskList } from "./task-list.js";
import { Task } from "./task.js";

export const TasksWindow = GObject.registerClass(
  {
    GTypeName: "TasksWindow",
    Template: "resource:///io/github/andrepg/Doit/ui/window.ui",
    InternalChildren: ["task_new_entry", "toast_overlay", "list_flow_box"],
  },
  class TasksWindow extends Adw.ApplicationWindow {
    /**
    * Our list store and persistence handler
    * @type {TaskListStore}
    * @private
    */
    _list_store;

    constructor(application) {
      super({ application });

      console.log(`[task-list] Initializing list store`);
      this._list_store = new TaskListStore();

      this._list_store.load()

      // Connect our main New Task button event with task creation
      this._task_new_entry.connect("activate", this.createTask.bind(this));

      this._list_flow_box.append(CreateTaskList(this._list_store));
    }


    /**
     * Add a new task to pending store and persist on disk
     */
    createTask() {
      const title = this._task_new_entry.get_text();

      if (title.trim() == "") return;

      console.log("[window] Ask Pending list to add new task");

      this._list_store.new_task(title.trim())

      console.log("[window] Cleaning up interface and inputs");
      this._task_new_entry.set_text("");

      console.log("[window] Dispatching user feedback");
      this.display_message_toast(
        `Task ${title} created`
      );
    }

    display_message_toast(message) {
      this._toast_overlay.add_toast(new Adw.Toast({ title: message }))
    }

  }
);
