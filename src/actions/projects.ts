/* projects.ts
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
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';

import { AppSignals, WidgetIds } from '~/app.enums.js';
import { ActionNames } from '~/static/actions.js';
import { AppLocale } from '~/app.strings.js';
import { DoItMainWindow } from '../views/doit.js';
import { TaskList } from '../views/task-list.js';
import { showToast } from './toast.js';
import { ProjectStore } from '~/store/project-store.js';
import { Task } from '~/models/task.js';

/**
 * Initializes the project-grouped task list in the main view.
 *
 * A single TaskList renders one PreferencesGroup per project dynamically,
 * listening to the store directly and bubbling row signals back here.
 * This action wires those signals to window-level side effects (opening
 * the edit form, showing toasts) and forwards the active project filter.
 *
 * @param projectStore The global ProjectStore instance.
 */
export default function projects(projectStore: ProjectStore) {
  const setup = (window: DoItMainWindow) => {
    const listContainer = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowListContainer,
    ) as Adw.PreferencesPage;

    const listStack = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowListStack,
    ) as Gtk.Stack;

    const taskList = new TaskList(listContainer, listStack);

    taskList.connect(AppSignals.TaskActivated, (_source, task: Task) => {
      window.activate_action(ActionNames.TaskEdit, new GLib.Variant('s', task.taskId));
    });

    taskList.connect(AppSignals.TaskUpdated, (_source, task: Task) => {
      showToast(task.done ? AppLocale.tasks.toast.finished : AppLocale.tasks.toast.restored);
    });

    taskList.connect(AppSignals.TaskDeleted, (_source, task: Task) => {
      showToast(task.deleted ? AppLocale.tasks.toast.softDeleted : AppLocale.tasks.toast.restored);
    });

    projectStore.connect(AppSignals.FilterChanged, (_: unknown, filter: string | null) => {
      taskList.set_filter(filter);
    });
  };

  return {
    setup,
  };
}
