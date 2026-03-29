/* new-task.ts
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
import Gtk40 from 'gi://Gtk';

import { AppSignals, WidgetIds } from '../enums.js';
import { AppLocale } from '../../../app.strings.js';

import { DoItMainWindow } from '../views/doit.js';
import { TaskListStore } from '../views/task-list-store.js';

import { showToast } from './toast.js';

/**
 * Handles the creation of new tasks from the main entry field.
 *
 * @param store The global TaskListStore.
 */
export const newTask = (store: TaskListStore) => {
  const buttonNewTaskId = WidgetIds.WindowButtonNewTask;
  const fieldNewTaskId = WidgetIds.WindowTaskNewEntry;

  let fieldNewTask: Gtk40.Entry;

  const get_widget = <T>(window: DoItMainWindow, id: string): T =>
    window.get_template_child(DoItMainWindow.$gtype, id) as unknown as T;

  /**
   * Parses the input string to extract a trailing project tag (`@ProjectName`).
   *
   * @param text The raw text typed by the user.
   * @returns An object containing the capitalized project name and the remaining clean text.
   */
  const parseProject = (text: string) => {
    let project = '';
    let parsedText = text;
    const projectMatch = text.match(/@(\S+)/);

    if (projectMatch) {
      const rawProject = projectMatch[1];
      project = rawProject.charAt(0).toUpperCase() + rawProject.slice(1).toLowerCase();
      parsedText = text.replace(projectMatch[0], '').trim();
    }

    return { project, parsedText };
  };

  /**
   * Creates and appends a new task to the store.
   *
   * @param text The complete raw input from the entry field.
   */
  const create_task = (text: string) => {
    const { project, parsedText: title } = parseProject(text);

    store.append_task({
      title,
      created_at: new Date().getTime(),
      project,
    });

    store.persist_store();
  };

  /**
   * Wires the new task button and entry field signals to their handlers.
   */
  const setup = (window: DoItMainWindow) => {
    const buttonNewTask = get_widget<Gtk40.Button>(window, buttonNewTaskId);
    buttonNewTask.connect(AppSignals.Clicked, () => fieldNewTask.grab_focus());

    fieldNewTask = get_widget<Gtk40.Entry>(window, fieldNewTaskId);
    fieldNewTask.connect(AppSignals.Apply, save_new_task);
  };

  const save_new_task = () => {
    const text = fieldNewTask.get_text().trim();

    if (text.length == 0) return;

    const { parsedText: title } = parseProject(text);
    if (title.length == 0) return;

    create_task(text);

    fieldNewTask.set_text('');

    showToast(AppLocale.tasks.toast.created);
  };

  return {
    setup,
  };
};
