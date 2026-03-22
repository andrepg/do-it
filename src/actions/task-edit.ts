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
import Gio from "gi://Gio";
import GObject from "gi://GObject";
import GLib from "gi://GLib";
import { DoItMainWindow } from "../ui-handler/doit.js";
import { TaskForm } from "../ui-handler/task-form.js";
import { ActionNames, AppSignals } from "../app.enums.js";

/**
 * Action to handle task editing via the bottom sheet.
 */
export default function taskEdit(taskForm: TaskForm, bottomSheet: any) {
    return {
        name: ActionNames.TaskEdit,
        parameter_type: new GLib.VariantType('i'),

        setup(window: DoItMainWindow) {
            const action = new Gio.SimpleAction({
                name: ActionNames.TaskEdit,
                parameter_type: new GLib.VariantType('i'),
            });

            action.connect(AppSignals.Activate, (_action, parameter) => {
                if (!parameter) return;

                const taskId = parameter.get_int32();
                taskForm.load_task(taskId);

                bottomSheet.set_open(true);
            });

            const closeAction = new Gio.SimpleAction({
                name: ActionNames.TaskEditClose,
            });

            closeAction.connect(AppSignals.Activate, () => {
                bottomSheet.set_open(false);
            });

            window.add_action(action);
            window.add_action(closeAction);
        }
    };
}
