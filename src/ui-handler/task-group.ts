/* task-group.ts
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

import { TaskList } from './task-list.js';
import type { TaskListStore } from './task-list-store.js';
import { TaskItem } from './task-item.js';

import { get_template_path } from '../utils/application.js';
import { AppLocale } from '../app.strings.js';

const GObjectProperties = {
  GTypeName: 'TaskGroup',
  Template: get_template_path('ui/task-group.ui'),
};

/**
 * A UI component representing a visual group of tasks for a specific project.
 *
 * Hierarchy: DoItMainWindow (Main view list_container) -> TaskGroup -> TaskList -> TaskItem(s)
 *
 * Inherits from Adw.PreferencesGroup. It applies a Gtk.CustomFilter to the
 * global TaskListStore so it only includes tasks matching its assigned project string.
 * It contains a single TaskList child that renders those filtered tasks.
 */
export class TaskGroup extends Adw.PreferencesGroup {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  /**
   * @constructor
   * @param {string} project - The respective project name to be filtered
   * @param {TaskListStore} store - The global state store containing all tasks
   */
  constructor(project: string, store: TaskListStore) {
    const groupTitle = project === '' ? AppLocale.tasks.list.noProject : project;

    super({ title: groupTitle });

    const filter = new Gtk.CustomFilter();
    filter.set_filter_func((item: GObject.Object) => (item as TaskItem).get_project() === project);

    const filterModel = new Gtk.FilterListModel({
      model: store,
      filter: filter,
    });

    const taskList = new TaskList(filterModel);

    this.add(taskList);
  }
}
