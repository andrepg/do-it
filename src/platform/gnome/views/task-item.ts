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

import { AppSignals, WidgetIds } from '../enums.js';
import { AppLocale } from '~/app.strings.js';
import { TaskDeleteButtonIcon, TaskEntryStyle } from '~/app.static.js';
import { ITask } from '~/app.types.js';
import type { ITaskView } from '~/core/interfaces/task-view.js';

import { get_template_path } from '~/utils/application.js';

const TaskItemProperties = {
  GTypeName: 'TaskItem',
  Template: get_template_path('task.ui'),
  Properties: {
    taskId: GObject.ParamSpec.int(
      'taskId',
      'Task Id',
      'Task unique id',
      GObject.ParamFlags.READABLE,
      0,
      2147483647,
      0,
    ),
    title: GObject.ParamSpec.string(
      'title',
      'Title',
      'Title task',
      GObject.ParamFlags.READWRITE,
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
 * Hierarchy: TaskGroup -> TaskList -> TaskItem
 *
 * Inherits from Adw.ActionRow. This widget displays the task's title,
 * creation date as a subtitle, and provides interactions such as a checkbox
 * for marking the task as done and a button for deleting it.
 */
export class TaskItem extends Adw.ActionRow implements ITaskView {
  static {
    GObject.registerClass(TaskItemProperties, this);
  }

  private _taskId = 0;

  private _title = '';

  private _created_at: Date;

  private _project = '';

  private _deleted = false;

  private _tags: string[] = [];

  private task_done!: Gtk.CheckButton;
  private task_delete!: Gtk.Button;

  constructor(
    taskId = 0,
    title = '',
    done = false,
    created: number | null = null,
    project = '',
    deleted = false,
  ) {
    super({
      title,
      subtitle: new Date(created ?? Date.now()).toLocaleDateString(),
    });

    this._taskId = taskId;
    this._title = title;
    this._project = project;
    this._created_at = new Date(created ?? Date.now());
    this._deleted = deleted;
    this._tags = [];

    this._init_widgets();

    this.task_done.set_active(done);

    this.task_delete.connect(AppSignals.Clicked, this._delete_task.bind(this));
    this.task_done.connect_after(AppSignals.Toggled, this._finish_task.bind(this));

    this._update_interface();
  }

  get taskId() {
    return this._taskId;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    if (this._title === value) return;
    this._title = value;
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
    return this._created_at.toISOString();
  }

  set created(value) {
    const date = new Date(value);
    if (this._created_at.getTime() === date.getTime()) return;
    this._created_at = date;
    this.notify('created');
  }

  get project() {
    return this._project;
  }

  set project(value) {
    if (this._project === value) return;
    this._project = value;
    this.notify('project');
  }

  get deleted() {
    return this._deleted;
  }

  set deleted(value) {
    if (this._deleted === value) return;
    this._deleted = value;
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
    const is_done = this.done;
    const is_deleted = this._deleted;

    let style = TaskEntryStyle.enabled;

    if (is_deleted) {
      style = TaskEntryStyle.deleted;
    } else if (is_done) {
      style = TaskEntryStyle.done;
    }

    this.set_opacity(style.opacity);
    this.set_title(this._title);
  }

  private _update_widget_interface(): void {
    const delete_icon = this._deleted ? TaskDeleteButtonIcon.deleted : TaskDeleteButtonIcon.default;

    this.task_delete.set_icon_name(delete_icon);
    this.task_done.set_sensitive(!this._deleted);
    this.set_activatable(!this._deleted);
  }

  private _delete_task() {
    this.deleted = !this.deleted;

    const message = this.deleted
      ? AppLocale.tasks.toast.softDeleted
      : AppLocale.tasks.toast.restored;

    showToast(message);

    this.emit(AppSignals.TaskDeleted, this);

    this._update_interface();
  }

  private _finish_task() {
    const message = this.done ? AppLocale.tasks.toast.finished : AppLocale.tasks.toast.restored;

    showToast(message);

    this.emit(AppSignals.TaskUpdated, this);

    this._update_interface();
  }

  public to_widget(): TaskItem {
    return this;
  }

  public to_object(): ITask {
    return {
      id: this._taskId,
      title: this.title,
      project: this.project,
      done: this.done,
      created_at: this._created_at.getTime(),
      deleted: this.deleted,
      tags: this._tags,
    };
  }

  public update(task: ITask): void {
    this._taskId = task.id ?? 0;
    this.title = task.title;
    this.done = task.done ?? false;
    this.deleted = task.deleted ?? false;
    this.project = task.project ?? '';
    this.created = new Date(task.created_at).toISOString();
    this._update_interface();
  }

  public onTaskUpdated(callback: (task: ITask) => void): void {
    this.connect(AppSignals.TaskUpdated, () => {
      callback(this.to_object());
    });
  }

  public onTaskDeleted(callback: (task: ITask) => void): void {
    this.connect(AppSignals.TaskDeleted, () => {
      callback(this.to_object());
    });
  }
}
