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

import { get_setting_int, get_setting_string, set_setting_int } from "../utils/application.js";
import { TaskListStore } from "../utils/list-store.js";
import { export_database, import_database } from "../utils/backup.js";
import { log } from "../utils/log-manager.js";
import { CreateTaskList } from "./task-list.js";
import { SortingModes, SortingModeSchema } from "../static.js";

export const TasksWindow = GObject.registerClass(
  {
    GTypeName: "TasksWindow",
    Template: "resource:///io/github/andrepg/Doit/ui/window.ui",
    InternalChildren: [
      "task_new_entry",
      "toast_overlay",
      "list_flow_box",
      "button_new_task",
      "task_sort_status_label"
    ],
  },
  class TasksWindow extends Adw.ApplicationWindow {
    /**
    * Our list store and persistence handler
    * @type {TaskListStore}
    * @private
    */
    _list_store;

    window_actions = [
      { name: 'new_task', event: 'activate', callback: () => this._task_new_entry.grab_focus() },
      { name: 'purge_deleted_tasks', event: 'activate', callback: () => this._list_store.purge_deleted() },
      { name: 'export_database', event: 'activate', callback: () => import_database(this) },
      { name: 'import_database', event: 'activate', callback: () => export_database(this) },

      { name: 'sort_by_title', event: 'activate', callback: () => this.sort_list_store(SortingModes.BY_TITLE) },
      { name: 'sort_by_status', event: 'activate', callback: () => this.sort_list_store(SortingModes.BY_STATUS) },
      { name: 'sort_by_creation_date', event: 'activate', callback: () => this.sort_list_store(SortingModes.BY_DATE) },
    ]

    constructor(application) {
      super({ application });

      log("window", "Initializing application")
      this._list_store = new TaskListStore();
      this._list_store.load()

      // Connect our main New Task button event with task creation
      this._bind_buttons_actions()

      // Shortcuts to purge and create a new task
      application.set_accels_for_action('win.new_task', ['<Control>n']);
      application.set_accels_for_action('win.purge_deleted_tasks', ['<Control>d']);

      this._list_flow_box.append(CreateTaskList(this._list_store));

      this._handle_window_settings();
      this._update_sorting_label();
    }

    sort_list_store(sorting_mode) {
      this._list_store.sort_list(sorting_mode);

      this._update_sorting_label();
    }

    _update_sorting_label() {
      const current_sort_strategy = get_setting_string(SortingModeSchema.strategy)
      let current_sort_mode = get_setting_string(SortingModeSchema.mode);

      switch (current_sort_mode) {
        case SortingModes.BY_DATE:
          current_sort_mode = 'by date'
          break;
        case SortingModes.BY_STATUS:
          current_sort_mode = 'by finished status'
          break;
        case SortingModes.BY_TITLE:
          current_sort_mode = 'by title'
          break;
        default:
          break;
      }

      this._task_sort_status_label.set_text(
        `Using sort mode ${current_sort_mode} with order ${current_sort_strategy}`
      );
    }

    _bind_buttons_actions() {
      this._task_new_entry.connect("activate", this._create_task.bind(this));
      this._button_new_task.connect("clicked", () => this._task_new_entry.grab_focus())

      for (const action of this.window_actions) {
        const gio_action = new Gio.SimpleAction({ name: action.name });
        gio_action.connect(action.event, action.callback)

        this.add_action(gio_action);
      }
    }

    _handle_window_settings() {
      this.set_default_size(
        get_setting_int('window-width'),
        get_setting_int('window-height')
      )

      this.connect('close-request', () => {
        const [width, height] = this.get_default_size();
        set_setting_int('window-width', width);
        set_setting_int('window-height', height);
      });
    }


    /**
     * Add a new task to pending store and persist on disk
     */
    _create_task() {
      const title = this._task_new_entry.get_text();

      if (title.trim() == "") return;

      log("window - new task", "Ask Pending list to add new task");

      this._list_store.append_task({ title: title.trim() });
      this._list_store.persist_store();

      log("window - new task", "Cleaning up interface and inputs");
      this._task_new_entry.set_text("");

      log("window - new task", "Dispatching user feedback");

      this.display_message_toast(
        _("Task %s created").format(title.trim())
      );
    }

    display_message_toast(message) {
      this._toast_overlay.add_toast(new Adw.Toast({ title: message }))
    }
  }
);
