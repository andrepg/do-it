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

import { Task } from "./task.js"
import { Persistence } from '../utils/persistence.js';
import { TaskListStore } from '../utils/list-store.js';
import { ConfirmTaskDeleteDialog } from './confirm-task-delete.js';
import { RESPONSES } from "../static.js";

export const TasksWindow = GObject.registerClass({
    GTypeName: 'TasksWindow',
    Template: 'resource:///io/github/andrepg/Doit/ui/window.ui',
    InternalChildren: [
        "list_box_pending",
        "list_box_finished",
        "delete_pending",
        "delete_finished",
        "task_new_entry",
        "toast_overlay",
        'finished_container'
    ],
}, class TasksWindow extends Adw.ApplicationWindow {
    constructor(application) {
        super({ application });

        this.loadTasksFirstTime();

        this._task_new_entry.connect('activate', this.createTask.bind(this))

        this._list_box_pending.bind_model(
            this.taskStorePending,
            (task) => task.to_widget()
        );

        this._list_box_finished.bind_model(
            this.taskStoreFinished,
            (task) => task.to_widget()
        );

        this.setupDeletePendingButton();
        this.setupDeleteFinishedButton();        
    }

    setupDeleteFinishedButton() {
        this._delete_finished.connect('clicked', () => {
            const dialog = new ConfirmTaskDeleteDialog();

            dialog.choose(this, null, null);

            dialog.connect('response', (_, response) => {
                if (response == RESPONSES.confirm.action) {
                    this.taskStoreFinished.remove_all();
                    this.persistTasks();
                }
            });
        });
    }

    setupDeletePendingButton() {
        this._delete_pending.connect('clicked', () => {
            const dialog = new ConfirmTaskDeleteDialog();

            dialog.choose(this, null, null);

            dialog.connect('response', (_, response) => {
                if (response == RESPONSES.confirm.action) {
                    this.taskStorePending.remove_all();
                    this.persistTasks();
                }
            });
        });
    }

    /**
    * Initialize our tasks lists, both pending and finished
    * from data returned from persistence class
    */
    loadTasksFirstTime() {
        this.persistence = new Persistence();
        
        this.taskStorePending = new TaskListStore({ item_type: Task });
        this.taskStoreFinished = new TaskListStore({ item_type: Task });

        for (let item of this.persistence.readFromFile()) {
            const task = new Task(item.taskId, item.title, item.done);
            this.connectTaskEvents(task);
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
    connectTaskEvents(task) {
        task.connect('task-updated', this.updateTask.bind(this));
        task.connect('task-deleted', function () {
            const dialog = new ConfirmTaskDeleteDialog({ heading: "Delete this task?" });

            dialog.connect('response', (_, response) => {
                if (response == RESPONSES.confirm.action) {
                    this.deleteTask(task)
                }
            })

            dialog.choose(this, null, null);
        }.bind(this));
    }

    /**
      * Add a new task to pending store and persist on disk
      */
    createTask() {
        const title = this._task_new_entry.get_text();

        if (title.trim() == '') return;

        const task = new Task(
            this.taskStorePending.n_items + 1,
            title.trim()
        );

        this.connectTaskEvents(task);

        this.taskStorePending.append(task);

        this.persistTasks();

        this._task_new_entry.set_text("");

        this._toast_overlay.add_toast(
            new Adw.Toast({ title: `Task "${task.title}" created` })
        );
    }

    /**
      * Update a single task, change store position (when marked as done)
      * and calls persistence to save user data
      */
    updateTask(task) {
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

        this.persistTasks();
    }

    /**
      * Delete a row from list store, depending on current
      * task status
      */
    deleteTask(task) {
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

        this.persistTasks();
        
        this._toast_overlay.add_toast(
            new Adw.Toast({ title: `Tasks deleted` })
        );
    }

    /**
      * Save current database in user folder, persisting our information
      */
    persistTasks() {
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


