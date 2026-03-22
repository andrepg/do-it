/* task-list.ts
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
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import { AppSignals } from '../app.enums.js';
import { get_template_path } from "../utils/application.js";
import { TaskItem } from './task-item.js';

const GObjectProperties = {
  GTypeName: "TaskList",
  Template: get_template_path('ui/task-list.ui'),
  Signals: {
    [AppSignals.ItemsChanged]: {
      param_types: []
    }
  }
}

/**
 * A ListBox container that renders a filtered set of TaskItems.
 * 
 * Hierarchy: TaskGroup -> TaskList -> TaskItem(s)
 * 
 * This class inherits from Gtk.ListBox and is responsible for binding 
 * a GTK ListModel (typically a Gtk.FilterListModel containing Tasks 
 * for a specific project) to create and render individual TaskItem widgets.
 */
export class TaskList extends Gtk.ListBox {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  /**
   * @constructor
   * @param {Gio.ListModel} model - The list model containing ITask objects (often filtered)
   */
  constructor(model: Gio.ListModel) {
    super();

    this.bind_model(model, (item: GObject.Object) => (item as TaskItem).to_widget());
  }
}

