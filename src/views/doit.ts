/* doit.ts
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

import { DoItSettings } from "~/static/settings.js";

import { log } from '~/utils/log-manager.js';
import { ProjectStore } from '~/store/project-store.js';
import { APPLICATION_NAME, get_template_path } from '~/utils/application.js';
import { get_settings } from '~/utils/settings.js';

import { AppSignals, WidgetIds } from '~/app.enums.js';
import { TaskForm } from './task-form.js';
import { PopoverSort } from './popover-sort.js';

import * as Actions from '../actions/index.js';
import { TaskListStore } from '~/store/list-store.js';

const settings = get_settings();

const options = {
  GTypeName: 'DoItMainWindow',
  Template: get_template_path('application.ui'),
  InternalChildren: [
    WidgetIds.WindowToastOverlay,
    WidgetIds.WindowSplitView,
    WidgetIds.WindowTaskNewEntry,

    // Header bar buttons
    WidgetIds.WindowButtonNewTask,

    // Content
    WidgetIds.WindowListContainer,
    WidgetIds.WindowSidebarProjectList,
    WidgetIds.WindowButtonSorting,

    // Task Form
    WidgetIds.TaskFormWidget,

    // Bottom Sheet
    WidgetIds.WindowBottomSheet,
  ],

  Signals: {
    [AppSignals.SortingChanged]: {},
  },
};

/**
 * The main application window for Do It.
 *
 * Manages the top-level UI components, including the sidebar and the main content area.
 * Also initializes global actions and connects to the global task and project stores.
 */
export class DoItMainWindow extends Adw.ApplicationWindow {
  static readonly LogClass = 'window';

  private button_sorting!: Gtk.MenuButton;

  private task_form!: TaskForm;

  private settings = get_settings();

  static {
    GObject.type_ensure(TaskForm.$gtype);
    GObject.registerClass(options, this);
  }

  constructor(application: Adw.Application) {
    super({
      application,
      title: APPLICATION_NAME,
      defaultWidth: settings.get_int(DoItSettings.windowWidth),
      defaultHeight: settings.get_int(DoItSettings.windowHeight),
    });

    log(DoItMainWindow.LogClass, 'Initializing task store');
    TaskListStore.get_default().load_tasks();

    this.initialize_widgets();
    this.initialize_actions();
    this.initialize_project_store();

    this.connect(AppSignals.SortingChanged, () => TaskListStore.get_default().sort_tasks());
  }

  private initialize_widgets() {
    log(DoItMainWindow.LogClass, 'Initializing widgets');

    this.button_sorting = this.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowButtonSorting,
    ) as Gtk.MenuButton;

    this.button_sorting.set_popover(new PopoverSort(this));
  }

  private initialize_project_store(): void {
    log(DoItMainWindow.LogClass, 'Initializing project store');

    const projectStore = ProjectStore.get_default();

    Actions.projects(projectStore).setup(this);
    Actions.projectSidebar(projectStore).setup(this);
  }

  private initialize_actions() {
    log(DoItMainWindow.LogClass, 'Initializing window actions');

    Actions.backup().setup(this);
    Actions.toast().setup(this);
    Actions.newTask().setup(this);
    Actions.purgeDeleted().setup(this);
    Actions.sidebar().setup(this);

    this.task_form = this.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.TaskFormWidget,
    ) as TaskForm;
    this.task_form.setup();

    Actions.taskEdit(this.task_form).setup(this);
  }

  public override vfunc_close_request(): boolean {
    log(DoItMainWindow.LogClass, 'Disposing main window');

    const [width, height] = this.get_default_size();

    log(DoItMainWindow.LogClass, 'Saving window size before closing');
    this.settings.set_int(DoItSettings.windowWidth, width);
    this.settings.set_int(DoItSettings.windowHeight, height);

    log(DoItMainWindow.LogClass, 'Persisting tasks');
    TaskListStore.get_default().persist_tasks();

    return super.vfunc_close_request();
  }
}
