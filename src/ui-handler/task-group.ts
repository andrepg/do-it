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

import { AppSignals } from '~/app.enums.js';
import { AppLocale } from '~/app.strings.js';

import { get_template_path } from '~/utils/application.js';

import { TaskItem } from './task-item.js';
import { TaskList } from './task-list.js';
import type { TaskListStore } from './task-list-store.js';

const GObjectProperties = {
  GTypeName: 'TaskGroup',
  Template: get_template_path('task-group.ui'),
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
  // TODO Move to AppLocale
  private static readonly DESCRIPTION = _("%s finished, %s deleted");

  private filter: Gtk.CustomFilter;
  private filterModel: Gtk.FilterListModel;
  private taskList: TaskList;

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

    this.filter = this.create_project_filter(project);
    this.filterModel = this.create_filter_model(store, this.filter);

    this.taskList = new TaskList(this.filterModel);
    this.add(this.taskList);

    this.filterModel.connect(AppSignals.ItemsChanged, () => this.set_group_description());
    store.connect(AppSignals.TaskUpdated, () => this.set_group_description());
    store.connect(AppSignals.TaskDeleted, () => this.set_group_description());

    this.set_group_description();
  }

  private set_group_description(): void {
    let finished = 0;
    let deleted = 0;

    const n_items = this.filterModel.get_n_items();

    for (let i = 0; i < n_items; i++) {
      const item = this.filterModel.get_item(i) as TaskItem;

      if (item.is_done()) finished++;
      if (item.is_deleted()) deleted++;
    }

    this.set_description(TaskGroup.DESCRIPTION.format(finished, deleted));
  }

  /**
   * Creates a filter that only includes tasks matching the given project.
   * @param project The project name to filter by.
   * @returns A Gtk.CustomFilter that only includes tasks matching the given project.
   */
  private create_project_filter(project: string): Gtk.CustomFilter {
    const filter = new Gtk.CustomFilter();

    filter.set_filter_func((item: GObject.Object) => (item as TaskItem).get_project() === project);

    return filter;
  }

  /**
   * Creates a filter list model that only includes tasks matching the given filter.
   * @param store The store containing all tasks.
   * @param filter The filter to apply to the store.
   * @returns A Gtk.FilterListModel that only includes tasks matching the given filter.
   */
  private create_filter_model(store: TaskListStore, filter: Gtk.CustomFilter): Gtk.FilterListModel {
    const filterModel = new Gtk.FilterListModel({
      model: store,
      filter: filter,
    });

    return filterModel;
  }
}
