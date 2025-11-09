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

import { get_setting_int, set_setting_int } from "../utils/application.js";
import { export_database, import_database } from "../utils/backup.js";
import { TaskListStore } from "../utils/list-store.js";
import { CreateTaskList } from "./task-list.js";

export const TasksWindow = GObject.registerClass(
  {
    GTypeName: "TasksWindow",
    Template: "resource:///io/github/andrepg/Doit/ui/window.ui",
    InternalChildren: [
      "task_new_entry",
      "toast_overlay",
      "list_flow_box",
      "button_new_task"
    ],
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

      this.setup_window_actions()

      application.set_accels_for_action('win.new_task', ['<Control>n']);

      this._list_flow_box.append(
        CreateTaskList(this._list_store)
      );

      this.setup_window_size()
    }

    setup_window_actions() {
      this._task_new_entry.connect("activate", this.createTask.bind(this));
      this._button_new_task.connect("clicked", this._task_new_entry.grab_focus)

      const action_new_task = new Gio.SimpleAction({ name: 'new_task' });
      const action_import_database = new Gio.SimpleAction({ name: 'import_database' });
      const action_export_database = new Gio.SimpleAction({ name: 'export_database' });

      action_new_task.connect('activate', () => this._task_new_entry.grab_focus());
      action_export_database.connect('activate', () => export_database(this));
      action_import_database.connect('activate', () => import_database(this));

      this.add_action(action_new_task);
      this.add_action(action_export_database);
      this.add_action(action_import_database);
    }

    setup_window_size() {
      const width = get_setting_int('window-width');
      const height = get_setting_int('window-height');

      this.set_default_size(width, height)

      this.connect('close-request', () => {
        const [width, height] = this.get_default_size();
        set_setting_int('window-width', width);
        set_setting_int('window-height', height);
        return false; // permite continuar o fechamento
      });
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
        _("Task %s created").format(title.trim())
      );
    }

    display_message_toast(message) {
      this._toast_overlay.add_toast(new Adw.Toast({ title: message }))
    }
  }
);
