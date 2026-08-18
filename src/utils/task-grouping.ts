/* task-grouping.ts
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
import { MagicFilters } from '~/static/sidebar.js';

import { Task } from '~/models/task.js';

/**
 * A single project's collected tasks and their status counters.
 */
export interface ProjectGroupEntry {
  tasks: Task[];
  finished: number;
  deleted: number;
}

/**
 * Groups an array of tasks by their project, counting finished and deleted
 * tasks per group.
 *
 * @param tasks The tasks to group.
 * @returns A map of project name to its collected tasks and counters.
 */
export const collect_project_groups = (tasks: Task[]): Map<string, ProjectGroupEntry> => {
  const groups = new Map<string, ProjectGroupEntry>();

  for (const task of tasks) {
    const key = task.project;

    let group = groups.get(key);
    if (!group) {
      group = { tasks: [], finished: 0, deleted: 0 };
      groups.set(key, group);
    }

    group.tasks.push(task);
    if (task.done) group.finished++;
    if (task.deleted) group.deleted++;
  }

  return groups;
};

/**
 * Returns whether the given project group should be visible under the
 * current filter, honoring the magic filters for all and none.
 *
 * @param projectName The project name of the group.
 * @param filter The active project filter.
 */
export const is_group_visible = (projectName: string, filter: string | null): boolean => {
  if (filter === MagicFilters.all || filter === null) return true;
  if (filter === MagicFilters.none) return projectName === '';

  return projectName === filter;
};
