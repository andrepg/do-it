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
    _task_list;

    constructor(application) {
      super({ application });

      // Connect our main New Task button event with task creation
      this._task_new_entry.connect("activate", this._createTask.bind(this));

      this._setup_task_list_ui();
    }


    _setup_task_list_ui() {
      this._task_list = new TaskList(
        "Your tasks",
        "Y of them unfinished"
      );

      this._task_list.connect('items-changed', () => {
        this._save_tasks_to_database()
        this._task_list.set_title(`${this._task_list.get_count()} tasks`)
      })

      let pending_clamp = new Adw.Clamp();

      pending_clamp.set_maximum_size(960);
      pending_clamp.set_child(this._task_list);

      this._list_flow_box.append(pending_clamp);
    }

    /**
     * Add a new task to pending store and persist on disk
     */
    _createTask() {
      const title = this._task_new_entry.get_text();

      if (title.trim() == "") return;

      console.log("[window] Ask Pending list to add new task");
      this._task_list.add_task({ title: title.trim() })

      console.log("[window] Cleaning up interface and inputs");
      this._task_new_entry.set_text("");

      console.log("[window] Dispatching user feedback");
      this.display_toast(
        new Adw.Toast({ title: `Task "${title.trim()}" created` }),
      );
    }

    display_toast(toast) {
      this._toast_overlay.add_toast(toast);
    }
  },
);
