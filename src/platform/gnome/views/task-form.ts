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
import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';

import { showToast } from '../actions/toast.js';

import { AppSignals, WidgetIds } from '../enums.js';
import { AppLocale } from '~/app.strings.js';
import { ITask } from '~/app.types.js';

import { get_template_path } from '~/utils/application.js';
import { log } from '~/utils/log-manager.js';

import { TaskItem } from './task-item.js';
import { TaskListStore } from './task-list-store.js';

import { ProjectManager } from '~/utils/project-manager.js';

const TaskFormProperties = {
  GTypeName: 'TaskForm',
  Template: get_template_path('task-form.ui'),
  InternalChildren: [
    WidgetIds.TaskFormEntryTitle,
    WidgetIds.TaskFormEntryProject,
    WidgetIds.TaskFormCheckDone,
    WidgetIds.TaskFormBtnDelete,
    WidgetIds.TaskFormBtnSave,
    WidgetIds.TaskFormBtnDiscard,
  ],
  Signals: {
    [AppSignals.TaskFormClosed]: {
      param_types: [GObject.TYPE_OBJECT],
    },
  },
};

/**
 * A form component to edit task details.
 */
export class TaskForm extends Gtk.Box {
  static readonly LogClass = 'task-form';

  static {
    GObject.registerClass(TaskFormProperties, this);
  }

  /**
   * Gtk widget references
   */
  private entry_title!: Adw.EntryRow;
  private entry_project!: Adw.EntryRow;
  private check_done!: Gtk.CheckButton;
  private btn_delete!: Gtk.Button;
  private btn_save!: Gtk.Button;
  private btn_discard!: Gtk.Button;

  /**
   * Instance and internal property handling
   */
  private _taskId: string | null = null;
  private _store!: TaskListStore;
  private _projectManager!: ProjectManager;

  constructor() {
    super();

    this.init_widgets();
    this.connect_signals();
    this.setup_key_controller();
  }

  private setup_key_controller(): void {
    const keyController = new Gtk.EventControllerKey();
    keyController.connect('key-pressed', (_controller: Gtk.EventControllerKey, keyval: number) => {
      if (keyval === Gdk.KEY_Escape) {
        this.dispatch_cancel();
        return true;
      }
      return false;
    });
    this.add_controller(keyController);
  }

  private connect_signals() {
    log(TaskForm.LogClass, 'Connecting form signals and reactions');

    this.btn_save.connect(AppSignals.Clicked, this.dispatch_save.bind(this));
    this.btn_discard.connect(AppSignals.Clicked, this.dispatch_cancel.bind(this));
    this.btn_delete.connect(AppSignals.Clicked, this.dispatch_delete.bind(this));
  }

  private init_widgets() {
    log(TaskForm.LogClass, 'Initializing widget instances');

    this.btn_save = this.get_template_child(
      TaskForm.$gtype,
      WidgetIds.TaskFormBtnSave,
    ) as Gtk.Button;
    this.btn_discard = this.get_template_child(
      TaskForm.$gtype,
      WidgetIds.TaskFormBtnDiscard,
    ) as Gtk.Button;
    this.btn_delete = this.get_template_child(
      TaskForm.$gtype,
      WidgetIds.TaskFormBtnDelete,
    ) as Gtk.Button;

    this.entry_title = this.get_template_child(
      TaskForm.$gtype,
      WidgetIds.TaskFormEntryTitle,
    ) as Adw.EntryRow;
    this.entry_project = this.get_template_child(
      TaskForm.$gtype,
      WidgetIds.TaskFormEntryProject,
    ) as Adw.EntryRow;
    this.check_done = this.get_template_child(
      TaskForm.$gtype,
      WidgetIds.TaskFormCheckDone,
    ) as Gtk.CheckButton;
  }

  public setup(store: TaskListStore, projectManager: ProjectManager): this {
    this._store = store;
    this._projectManager = projectManager;

    return this;
  }

  /**
   * Loads a task into the form by its ID.
   */
  public load_task(taskId: string) {
    log(TaskForm.LogClass, `Loading task: ${taskId}`);
    this._taskId = taskId;

    const taskItem = this.find_task();

    if (!taskItem) {
      log(TaskForm.LogClass, `Failed to find task: ${taskId}`);
      return;
    }

    const data = taskItem.to_object();
    this.entry_title.set_text(data.title);
    this.entry_project.set_text(data.project || '');
    this.check_done.set_active(data.done || false);

    this.setup_project_autocomplete();
  }

  /**
   * Finds the task currently loaded in the form.
   */
  private find_task(): TaskItem | null {
    if (this._taskId === null) return null;
    return this._store.find_by_id(this._taskId);
  }

  /**
   * Setup project autocomplete on project entry
   */
  private setup_project_autocomplete(): void {}

  /*

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
    }*/

  /**
   * Save current task on list and dispatch window action to close bottom sheet
   */
  public dispatch_save(): void {
    log(TaskForm.LogClass, 'Dispatching save action');
    const task = this.find_task()?.to_object();
    const title = this.entry_title.get_text().trim();

    if (title === '') {
      showToast(AppLocale.tasks.form.errorEmptyTitle);
      return;
    }

    if (!task || !task.id) {
      log(TaskForm.LogClass, 'No task loaded to save');
      return;
    }

    log(TaskForm.LogClass, `Updating task in store: ${task.id}`);

    // Update existing task data
    // We recreate it by removing and re-appending, which is the pattern in TaskListStore
    this.update_task({
      ...task,
      title: title,
      project: this.entry_project.get_text().trim(),
      done: this.check_done.get_active(),
    });

    this.dispatch_cancel();

    showToast(AppLocale.tasks.toast.updated);
  }

  private update_task(task: ITask) {
    this._store.remove_task(task.id || '');
    this._store.append_task(task);
    this._store.persist_store();
  }

  /**
   * Clean the form state and call window action to close bottom sheet
   */
  public dispatch_cancel(): void {
    log(TaskForm.LogClass, 'Dispatching cancel/close action');

    this._taskId = null;
    this.entry_title.set_text('');
    this.entry_project.set_text('');
    this.check_done.set_active(false);

    this.emit(AppSignals.TaskFormClosed, this);
  }

  /**
   * Update deleted status and save
   */
  private dispatch_delete() {
    log(TaskForm.LogClass, 'Dispatching delete action');

    if (this._taskId === null) return;

    const taskItem = this.find_task();

    if (taskItem) {
      this.update_task({
        ...taskItem.to_object(),
        deleted: true,
      });

      this.dispatch_cancel();

      showToast(AppLocale.tasks.toast.softDeleted);
    }
  }
}
