/* purge-deleted.ts
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
import Adw1 from "gi://Adw";
import Gio from "gi://Gio";
import { TaskListStore } from "../ui-handler/task-list-store.js";
import { ActionNames, AppSignals } from "../app.enums.js";

/**
 * Provides an action to permanently remove soft-deleted tasks from the database.
 * 
 * @param taskListStore The global TaskListStore.
 */
const purgeDeleted = (taskListStore: TaskListStore) => {
    /**
     * Initializes the "purge_deleted_tasks" action and binds it to the main window.
     * 
     * @param window The main application window.
     */
    const setup = (window: Adw1.ApplicationWindow) => {
        const action = new Gio.SimpleAction({ name: ActionNames.PurgeDeletedTasks });

        action.connect(AppSignals.Activate, () => taskListStore.purge_deleted());

        window.add_action(action);
    }

    return { setup }
}

export default purgeDeleted;