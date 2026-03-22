/* task-form.ts
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
import Adw from "gi://Adw";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import { get_template_path } from "../utils/application.js";
import { TaskListStore } from "./task-list-store.js";
import { ProjectManager } from "../utils/project-manager.js";
import { TaskItem } from "./task-item.js";
import { AppSignals, WidgetIds } from "../app.enums.js";
import { showToast } from "../actions/toast.js";

const TaskFormProperties = {
    GTypeName: 'TaskForm',
    Template: get_template_path('ui/task-form.ui'),
    InternalChildren: [
        WidgetIds.TaskFormEntryTitle,
        WidgetIds.TaskFormEntryProject,
        WidgetIds.TaskFormCheckDone,
        WidgetIds.TaskFormBtnDelete,
        WidgetIds.TaskFormBtnSave,
        WidgetIds.TaskFormBtnDiscard
    ],
    Signals: {
        [AppSignals.TaskFormClosed]: {},
    }
}

/**
 * A form component to edit task details.
 */
export class TaskForm extends Gtk.Box {
    static readonly GType = TaskForm as unknown as GObject.GType;

    static {
        GObject.registerClass(TaskFormProperties, this);
    }

    private entry_title!: Adw.EntryRow;
    private entry_project!: Adw.EntryRow;
    private check_done!: Gtk.CheckButton;
    private btn_delete!: Gtk.Button;
    private btn_save!: Gtk.Button;
    private btn_discard!: Gtk.Button;

    private _taskId: number | null = null;
    private _store!: TaskListStore;
    private _projectManager!: ProjectManager;

    constructor() {
        super();

        this.btn_save = this.get_template_child(TaskForm.GType, WidgetIds.TaskFormBtnSave);
        this.btn_discard = this.get_template_child(TaskForm.GType, WidgetIds.TaskFormBtnDiscard);
        this.btn_delete = this.get_template_child(TaskForm.GType, WidgetIds.TaskFormBtnDelete);

        this.btn_save.connect(AppSignals.Activate, this._on_save.bind(this));
        this.btn_discard.connect(AppSignals.Activate, this._on_discard.bind(this));
        this.btn_delete.connect(AppSignals.Clicked, this._on_delete.bind(this));

        //   this._setup_project_completion();
    }

    public setup(store: TaskListStore, projectManager: ProjectManager) {
        this._store = store;
        this._projectManager = projectManager;
    }

    /**
     * Loads a task into the form by its ID.
     */
    public load_task(taskId: number) {
        this._taskId = taskId;
        const taskItem = this._store.find_by_id(taskId);
        if (!taskItem) return;

        const data = taskItem.to_object();
        this.entry_title.set_text(data.title);
        this.entry_project.set_text(data.project || "");
        this.check_done.set_active(data.done || false);
    }

    private _on_save() {
        if (this._taskId === null) return;

        const taskItem = this._store.find_by_id(this._taskId);
        if (!taskItem) return;

        const title = this.entry_title.get_text().trim();
        const project = this.entry_project.get_text().trim();
        const done = this.check_done.get_active();

        if (title === "") {
            showToast(_("Title cannot be empty"));
            return;
        }

        taskItem.set_property("title", title);
        taskItem.set_property("project", project);
        taskItem.set_property("done", done);

        taskItem.emit(AppSignals.TaskUpdated, taskItem);

        showToast(_("Task updated"));
        this.emit(AppSignals.TaskFormClosed);
    }

    private _on_discard() {
        this.emit(AppSignals.TaskFormClosed);
    }

    private _on_delete() {
        if (this._taskId === null) return;
        const taskItem = this._store.find_by_id(this._taskId);
        if (taskItem) {
            taskItem.emit(AppSignals.TaskDeleted, taskItem);
            showToast(_("Task deleted"));
            this.emit(AppSignals.TaskFormClosed);
        }
    }

    private _setup_project_completion() {
        const completion = new Gtk.EntryCompletion();
        const model = new Gtk.ListStore();
        model.set_column_types([GObject.TYPE_STRING]);
        completion.set_model(model);
        completion.set_text_column(0);
        completion.set_inline_completion(true);
        completion.set_popup_single_match(false);

        this.connect("map", () => {
            if (this._projectManager) {
                model.clear();
                this._projectManager.get_projects().forEach(project => {
                    if (project) {
                        const iter = model.append();
                        model.set(iter, [0], [project]);
                    }
                });
            }
        });

        let entry: Gtk.Entry | null = null;
        let child = this.entry_project.get_first_child();
        while (child) {
            if (child instanceof Gtk.Entry) {
                entry = child;
                break;
            }
            child = child.get_next_sibling();
        }

        if (entry) {
            entry.set_completion(completion);
        }
    }
}
