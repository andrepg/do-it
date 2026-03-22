/* task-item.ts
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
import Adw from "gi://Adw"
import GObject from "gi://GObject"
import { ITask } from "../app.types.js";
import { get_template_path } from "../utils/application.js";
import Gtk from "gi://Gtk";
import { showToast } from "../actions/toast.js";
import { AppSignals, WidgetIds } from "../app.enums.js";
import { TaskDeleteButtonIcon, TaskEntryStyle } from "../app.static.js";

const TaskItemProperties = {
  GTypeName: 'TaskItem',
  Template: get_template_path('ui/task.ui'),
  Properties: {
    taskId: GObject.ParamSpec.int(
      "taskId",
      "Task Id",
      "Task unique id",
      GObject.ParamFlags.READABLE,
      0,
      2147483647,
      0
    ),
    title: GObject.ParamSpec.string(
      "title",
      "Title",
      "Title task",
      GObject.ParamFlags.READWRITE,
      ""
    ),
    done: GObject.ParamSpec.boolean(
      "done",
      "Done",
      "Task status",
      GObject.ParamFlags.READWRITE,
      false
    ),
    created: GObject.ParamSpec.string(
      "created",
      "Created At",
      "Task creation timestamp",
      GObject.ParamFlags.READWRITE,
      ""
    ),
    project: GObject.ParamSpec.string(
      "project",
      "Project",
      "Task project",
      GObject.ParamFlags.READWRITE,
      ""
    ),
  },
  InternalChildren: [WidgetIds.TaskItemTaskDone, WidgetIds.TaskItemTaskDelete],
  Signals: {
    [AppSignals.TaskUpdated]: {
      param_types: [GObject.TYPE_OBJECT],
    },
    [AppSignals.TaskDeleted]: {
      param_types: [GObject.TYPE_OBJECT],
    },
  },
}

/**
 * Represents a single task row in the UI.
 * 
 * Hierarchy: TaskGroup -> TaskList -> TaskItem
 * 
 * Inherits from Adw.ActionRow. This widget displays the task's title, 
 * creation date as a subtitle, and provides interactions such as a checkbox 
 * for marking the task as done and a button for deleting it.
 */
export class TaskItem extends Adw.ActionRow {
  static {
    GObject.registerClass(TaskItemProperties, this);
  }

  /**
   * Internal Properties
   */
  private _taskId = 0;

  private _created_at: Date;

  private _project = '';

  private _deleted = false;

  private _tags: string[] = [];

  /**
   * Internal Children
   */
  private task_done!: Gtk.CheckButton;
  private task_delete!: Gtk.Button;

  constructor(
    taskId = 0,
    title = "",
    done = false,
    created: number | null = null,
    project = "",
  ) {
    super({
      title,
      subtitle: new Date(created ?? Date.now()).toLocaleDateString(),
    });

    this._taskId = taskId;
    this._project = project;
    this._created_at = new Date(created ?? Date.now());
    this._deleted = false;
    this._tags = [];

    this.task_delete = this.get_template_child(TaskItem as unknown as GObject.GType, WidgetIds.TaskItemTaskDelete) as Gtk.Button;
    this.task_delete.connect(AppSignals.Clicked, this._delete_task.bind(this));

    this.task_done = this.get_template_child(TaskItem as unknown as GObject.GType, WidgetIds.TaskItemTaskDone) as Gtk.CheckButton;

    this.task_done.set_active(done);
    this.task_done.connect_after(AppSignals.Toggled, this._finish_task.bind(this));

    this._update_interface();
  }

  private _update_interface(): void {
    this._update_widget_style();
    this._update_widget_interface();
  }

  private _update_widget_style(): void {
    const is_disabled = this._deleted || this.task_done.get_active();

    const opacity = is_disabled ? TaskEntryStyle.disabled.opacity : TaskEntryStyle.enabled.opacity;
    const markup = is_disabled ? TaskEntryStyle.disabled.markup : TaskEntryStyle.enabled.markup;

    this.set_use_markup(true);
    this.set_opacity(opacity);
    this.set_title(markup.format(this.title));
  }

  private _update_widget_interface(): void {
    const delete_icon = this._deleted
      ? TaskDeleteButtonIcon.deleted
      : TaskDeleteButtonIcon.default;

    this.task_delete.set_icon_name(delete_icon);
    this.task_done.set_sensitive(!this._deleted);
  }

  private _delete_task() {
    this._deleted = !this._deleted;

    const message = this._deleted ? _("Task deleted") : _("Task restored");

    showToast(message)

    this.emit(AppSignals.TaskDeleted, this);

    this._update_interface();
  }

  private _finish_task() {
    const message = this.task_done.get_active() ? _("Task finished") : _("Task restored");

    showToast(message)

    this.emit(AppSignals.TaskUpdated, this);

    this._update_interface();
  }

  /**
   * Retrieves the raw string name of the project associated with this task.
   */
  public get_project(): string {
    return this._project;
  }

  /**
   * Casts the underlying object to its GTK TaskItem widget shape.
   */
  public to_widget(): TaskItem {
    return this;
  }

  /**
   * Hydrates the internal Adwaita row state into a JSON-serializable ITask object.
   */
  public to_object(): ITask {
    return {
      id: this._taskId,
      title: this.title,
      project: this._project,
      done: this.task_done.get_active(),
      created_at: this._created_at.getTime(),
      deleted: this._deleted,
      tags: this._tags,
    };
  }
}