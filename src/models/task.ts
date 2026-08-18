/* task.ts
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
import GLib from 'gi://GLib';

import { ITask } from '~/app.types.js';

const TaskProperties = {
  GTypeName: 'Task',
  Properties: {
    taskId: GObject.ParamSpec.string(
      'taskId',
      'Task Id',
      'Task unique id',
      GObject.ParamFlags.READABLE,
      '',
    ),
    title: GObject.ParamSpec.string(
      'title',
      'Title',
      'Task title',
      GObject.ParamFlags.READWRITE,
      '',
    ),
    done: GObject.ParamSpec.boolean(
      'done',
      'Done',
      'Task done status',
      GObject.ParamFlags.READWRITE,
      false,
    ),
    created_at: GObject.ParamSpec.int64(
      'created_at',
      'Created At',
      'Task creation timestamp',
      GObject.ParamFlags.READABLE,
      0,
      0,
      0,
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
};

/**
 * Pure data model for a task entity.
 *
 * Wraps the {@link ITask} interface in a GObject so it can be stored
 * directly in a {@link Gio.ListStore}. Holds no UI knowledge —
 * signals and widget interactions belong to the view layer.
 */
export class Task extends GObject.Object {
  static {
    GObject.registerClass(TaskProperties, this);
  }

  private _data: ITask;

  constructor(task: ITask) {
    super();
    this._data = {
      id: task.id ?? GLib.uuid_string_random(),
      title: task.title,
      created_at: task.created_at ?? Date.now(),
      project: task.project ?? '',
      done: task.done ?? false,
      deleted: task.deleted ?? false,
    };
  }

  get taskId(): string {
    return this._data.id ?? '';
  }

  get title(): string {
    return this._data.title;
  }

  set title(value: string) {
    if (this._data.title === value) return;
    this._data.title = value;
    this.notify('title');
  }

  get done(): boolean {
    return this._data.done ?? false;
  }

  set done(value: boolean) {
    if (this._data.done === value) return;
    this._data.done = value;
    this.notify('done');
  }

  /**
   * ISO string representation of the creation date.
   * Provided for sort-compatibility with the {@link SortableTask} interface.
   */
  get created(): string {
    return new Date(this._data.created_at).toISOString();
  }

  get created_at(): number {
    return this._data.created_at;
  }

  get project(): string {
    return this._data.project ?? '';
  }

  set project(value: string) {
    if (this._data.project === value) return;
    this._data.project = value;
    this.notify('project');
  }

  get deleted(): boolean {
    return this._data.deleted ?? false;
  }

  set deleted(value: boolean) {
    if (this._data.deleted === value) return;
    this._data.deleted = value;
    this.notify('deleted');
  }

  /**
   * Serializes the task to a plain {@link ITask} object.
   */
  public to_object(): ITask {
    return {
      id: this._data.id,
      title: this._data.title,
      project: this._data.project,
      done: this._data.done,
      created_at: this._data.created_at,
      deleted: this._data.deleted,
    };
  }

  /**
   * Batch-updates all fields from a plain {@link ITask} object.
   */
  public update(task: ITask): void {
    this._data.id = task.id ?? this._data.id;
    this.title = task.title;
    this.done = task.done ?? false;
    this.deleted = task.deleted ?? false;
    this.project = task.project ?? '';
    this._data.created_at = task.created_at;
  }
}
