/* project-group.ts
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

import { AppLocale } from '~/app.strings.js';

import { Task } from '~/models/task.js';
import { TaskItem } from './task-item.js';
import { ProjectGroupEntry, is_group_visible } from '~/utils/task-grouping.js';

/**
 * Renders a single project as one Adw.PreferencesGroup with its tasks.
 *
 * Hierarchy: TaskList -> ProjectGroup -> TaskItem(s)
 *
 * Owns the group widget, its attached rows and its description counters.
 * Rows are detached and re-attached on every render through the given
 * factory callback, keeping widget reuse and store wiring in the
 * TaskList orchestrator.
 */
export class ProjectGroup {
  private projectName: string;
  private preferencesGroup: Adw.PreferencesGroup;
  private rows: TaskItem[] = [];

  /**
   * @constructor
   * @param {string} projectName - The project name backing this group.
   */
  constructor(projectName: string) {
    this.projectName = projectName;

    this.preferencesGroup = new Adw.PreferencesGroup({
      title: projectName === '' ? AppLocale.tasks.list.noProject : projectName,
    });
  }

  /**
   * The underlying PreferencesGroup widget, ready to be added to a page.
   */
  get widget(): Adw.PreferencesGroup {
    return this.preferencesGroup;
  }

  /**
   * Re-renders the group rows from the collected entry and refreshes
   * the description counters.
   * @param entry The collected tasks and counters for this project.
   * @param createRow Factory returning the TaskItem widget for a task.
   */
  public render(entry: ProjectGroupEntry, createRow: (task: Task) => TaskItem): void {
    this.detach_rows();

    for (const task of entry.tasks) {
      const row = createRow(task);

      this.preferencesGroup.add(row);
      this.rows.push(row);
    }

    this.preferencesGroup.set_description(
      AppLocale.tasks.list.groupDescription.format(entry.finished, entry.deleted),
    );
  }

  /**
   * Shows or hides the group based on the active project filter.
   * @param filter The active project filter, or null to show all groups.
   */
  public apply_filter(filter: string | null): void {
    this.preferencesGroup.set_visible(is_group_visible(this.projectName, filter));
  }

  /**
   * Detaches every rendered row from the group's internal list box.
   *
   * Rows cannot be enumerated from the group itself, so previously
   * added rows are tracked and removed through the group API.
   */
  private detach_rows(): void {
    for (const row of this.rows) {
      this.preferencesGroup.remove(row);
    }

    this.rows = [];
  }
}
