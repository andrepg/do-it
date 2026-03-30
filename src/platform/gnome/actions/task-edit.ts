/* task-edit.ts
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
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Adw1 from 'gi://Adw';

import { ActionNames, AppSignals, WidgetIds } from '../enums.js';
import { DoItMainWindow } from '../views/doit.js';
import { TaskForm } from '../views/task-form.js';
import { log } from '~/utils/log-manager.js';

/**
 * Action to handle task editing via the bottom sheet.
 */
export default function taskEdit(taskForm: TaskForm) {
  let bottomSheet: Adw1.BottomSheet;

  const setup = (window: DoItMainWindow) => {
    bottomSheet = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowBottomSheet,
    ) as Adw1.BottomSheet;

    task_edit_action(window);
    task_edit_close_action();
    task_save_action(window);
    task_close_action(window);
  };

  const toggle_bottom_sheet = () => {
    bottomSheet.set_open(!bottomSheet.get_open());
  };

  const task_edit_action = (window: DoItMainWindow) => {
    const action = new Gio.SimpleAction({
      name: ActionNames.TaskEdit,
      parameter_type: new GLib.VariantType('s'),
    });

    action.connect(AppSignals.Activate, (_action, parameter) => {
      if (!parameter) return;

      const taskId = parameter.get_string()[0];

      taskForm.load_task(taskId);
      toggle_bottom_sheet();
    });

    window.add_action(action);
  };

  const task_edit_close_action = () => {
    taskForm.connect(AppSignals.TaskFormClosed, () => {
      log(DoItMainWindow.LogClass, 'Task form closed signal received, Closing bottom sheet');
      toggle_bottom_sheet();
    });
  };

  const task_save_action = (window: DoItMainWindow) => {
    const action = new Gio.SimpleAction({ name: 'task-edit.save' });

    action.connect(AppSignals.Activate, () => {
      if (taskForm) {
        taskForm.dispatch_save();
      }
    });

    window.add_action(action);
  };

  const task_close_action = (window: DoItMainWindow) => {
    const action = new Gio.SimpleAction({ name: 'task-edit.close' });

    action.connect(AppSignals.Activate, () => {
      if (taskForm) {
        taskForm.dispatch_cancel();
      }
    });

    window.add_action(action);
  };

  return {
    name: ActionNames.TaskEdit,
    parameter_type: new GLib.VariantType('s'),

    setup,
  };
}
