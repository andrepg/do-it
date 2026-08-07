/* projects-utils.ts
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

import { SortingField, SortingStrategy } from "~/static/sorting.js";
import { TaskGroup } from '~/views/task-group.js';
import { TaskListStore } from '~/views/task-list-store.js';
import { retrieve_sort_preferences } from '~/utils/tasks.sort.js';
import { sort_by_project_name } from '~/utils/sort.js';

export const create_task_group = (project: string, store: TaskListStore) => {
  return new TaskGroup(project, store);
};

export const add_project_group = (
  container: Adw.PreferencesPage,
  project: string,
  projectGroups: Map<string, TaskGroup>,
  store: TaskListStore,
) => {
  if (projectGroups.has(project)) {
    return;
  }

  const taskGroup = create_task_group(project, store);
  projectGroups.set(project, taskGroup);

  container.add(taskGroup);
};

export const remove_project_group = (
  container: Adw.PreferencesPage,
  project: string,
  projectGroups: Map<string, TaskGroup>,
) => {
  if (!projectGroups.has(project)) return;

  const taskGroup = projectGroups.get(project);

  if (taskGroup) {
    container.remove(taskGroup);
    projectGroups.delete(project);
  }
};

export const applyFilter = (projectGroups: Map<string, TaskGroup>, filter: string | null) => {
  for (const [project, taskGroup] of projectGroups.entries()) {
    taskGroup.set_visible(filter === null || project === filter);
  }
};

export const reorder_groups = (
  container: Adw.PreferencesPage,
  projectGroups: Map<string, TaskGroup>,
) => {
  const { mode, strategy } = retrieve_sort_preferences();
  const sortedProjects = Array.from(projectGroups.keys()).sort(
    mode === SortingField.byProject
      ? sort_by_project_name(strategy)
      : sort_by_project_name(SortingStrategy.ascending),
  );

  for (const project of sortedProjects) {
    const taskGroup = projectGroups.get(project);
    if (taskGroup) {
      container.remove(taskGroup);
      container.add(taskGroup);
    }
  }
};
