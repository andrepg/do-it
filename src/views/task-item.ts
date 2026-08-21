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
import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { showToast } from '../actions/toast.js';

import { AppSignals, WidgetIds } from '~/app.enums.js';
import { AppLocale } from '~/app.strings.js';
import { TaskDeleteButtonIcon, TaskEntryStyle } from '~/static/tasks.js';
import { ITask } from '~/app.types.js';

import { get_template_path } from '~/utils/application.js';
import { Task } from '~/models/task.js';
import { log } from '~/utils/log-manager.js';

const TaskItemProperties = {
  GTypeName: 'TaskItem',
  Template: get_template_path('task.ui'),
  Properties: {
    taskId: GObject.ParamSpec.string(
      'taskId',
      'Task Id',
      'Task unique id',
      GObject.ParamFlags.READABLE,
      '',
    ),
    done: GObject.ParamSpec.boolean(
      'done',
      'Done',
      'Task status',
      GObject.ParamFlags.READWRITE,
      false,
    ),
    created: GObject.ParamSpec.string(
      'created',
      'Created At',
      'Task creation timestamp',
      GObject.ParamFlags.READWRITE,
      '',
    ),
    project: GObject.ParamSpec.string(
      'project',
      'Project',
      'Task project',
      GObject.ParamFlags.READWRITE,
      '',
    ),
    deleted: GObject.ParamSpec.boolean(
      'deleted',
      'Deleted',
      'Task deleted status',
      GObject.ParamFlags.READWRITE,
      false,
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
};

/**
 * Represents a single task row in the UI.
 *
 * Hierarchy: TaskList -> TaskItem
 *
 * Inherits from Adw.ActionRow. This widget displays the task's title,
 * creation date as a subtitle, and provides interactions such as a checkbox
 * for marking the task as done and a button for deleting it.
 *
 * Wraps a {@link Task} model instance — all data reads/writes delegate
 * to the wrapped task. Signals (TaskUpdated, TaskDeleted) remain here
 * because they are triggered by user interaction with the UI.
 */
export class TaskItem extends Adw.ActionRow {
  static {
    GObject.registerClass(TaskItemProperties, this);
  }

  private task: Task;

  private task_done!: Gtk.CheckButton;
  private task_delete!: Gtk.Button;

  constructor(task: Task) {
    // `title` must not be passed to super(): the overridden getter dereferences
    // `this.task`, which is only assigned after parent construction completes.
    super({
      subtitle: new Date(task.created_at).toLocaleDateString(),
    });

    this.task = task;

    log(TaskItemProperties.GTypeName, `Initializing task ${task.title} - ${task.taskId}`);

    this._init_widgets();

    this.task_done.set_active(task.done);

    this.task_delete.connect(AppSignals.Clicked, this._delete_task.bind(this));
    this.task_done.connect_after(AppSignals.Toggled, this._finish_task.bind(this));

    this._update_interface();
  }

  get taskId() {
    return this.task.taskId;
  }

  get title() {
    return this.task.title;
  }

  set title(value) {
    this.task.title = value;
    this.notify('title');
  }

  get done() {
    return this.task_done.get_active();
  }

  set done(value) {
    if (this.task_done.get_active() === value) return;
    this.task_done.set_active(value);
    this.notify('done');
  }

  get created() {
    return this.task.created;
  }

  get project() {
    return this.task.project;
  }

  set project(value) {
    this.task.project = value;
    this.notify('project');
  }

  get deleted() {
    return this.task.deleted;
  }

  set deleted(value) {
    this.task.deleted = value;
    this.notify('deleted');
  }

  private _init_widgets() {
    this.task_delete = this.get_template_child(
      TaskItem.$gtype,
      WidgetIds.TaskItemTaskDelete,
    ) as Gtk.Button;
    this.task_done = this.get_template_child(
      TaskItem.$gtype,
      WidgetIds.TaskItemTaskDone,
    ) as Gtk.CheckButton;
  }

  private _update_interface(): void {
    this._update_widget_style();
    this._update_widget_interface();
  }

  private _update_widget_style(): void {
    const is_done = this.task.done;
    const is_deleted = this.task.deleted;

    let style = TaskEntryStyle.enabled;

    if (is_deleted) {
      style = TaskEntryStyle.deleted;
    } else if (is_done) {
      style = TaskEntryStyle.done;
    }

    this.set_opacity(style.opacity);
    this.set_title(this.task.title);
  }

  private _update_widget_interface(): void {
    const delete_icon = this.task.deleted
      ? TaskDeleteButtonIcon.deleted
      : TaskDeleteButtonIcon.default;

    this.task_delete.set_icon_name(delete_icon);
    this.task_done.set_sensitive(!this.task.deleted);
    this.set_activatable(!this.task.deleted);
  }

  private _delete_task() {
    this.task.deleted = !this.task.deleted;

    const message = this.task.deleted
      ? AppLocale.tasks.toast.softDeleted
      : AppLocale.tasks.toast.restored;

    showToast(message);

    this.emit(AppSignals.TaskDeleted, this);

    this._update_interface();
  }

  private _finish_task() {
    this.task.done = this.task_done.get_active();

    const message = this.task.done
      ? AppLocale.tasks.toast.finished
      : AppLocale.tasks.toast.restored;

    showToast(message);

    this.emit(AppSignals.TaskUpdated, this);

    this._update_interface();
  }

  public to_object(): ITask {
    return this.task.to_object();
  }

  public update(data: ITask): void {
    this.task.update(data);
    this._update_interface();
    this.emit(AppSignals.TaskUpdated, this);
  }
}
