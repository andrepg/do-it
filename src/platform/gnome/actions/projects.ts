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

import { AppSignals, WidgetIds } from '../enums.js';
import { SortingField, SortingStrategy } from '../../../app.enums.js';
import { useTaskSort } from '../../../hooks/tasks.sort.js';

import { DoItMainWindow } from '../views/doit.js';
import { TaskGroup } from '../views/task-group.js';
import { TaskListStore } from '../views/task-list-store.js';

import { ProjectManager } from '../../../utils/project-manager.js';

/**
 * Initializes and manages the grouping of tasks by project in the main view.
 *
 * @param store The global TaskListStore.
 * @param projectManager The global ProjectManager instance.
 */
export default function projects(store: TaskListStore, projectManager: ProjectManager) {
  const projectGroups: Map<string, TaskGroup> = new Map();
  const taskSort = useTaskSort();

  const create_task_group = (project: string) => new TaskGroup(project, store);

  /**
   * Appends a new project group to the main list container.
   */
  const add_project_group = (container: Adw.PreferencesPage, project: string) => {
    if (projectGroups.has(project)) {
      return;
    }

    const taskGroup = create_task_group(project);
    projectGroups.set(project, taskGroup);

    container.add(taskGroup);
  };

  /**
   * Removes an existing project group from the main list container.
   */
  const remove_project_group = (container: Adw.PreferencesPage, project: string) => {
    if (!projectGroups.has(project)) return;

    const taskGroup = projectGroups.get(project);

    if (taskGroup) {
      container.remove(taskGroup);
      projectGroups.delete(project);
    }
  };

  /**
   * Sets the visibility of each project group based on the currently active filter.
   */
  const applyFilter = (filter: string | null) => {
    for (const [project, taskGroup] of projectGroups.entries()) {
      taskGroup.set_visible(filter === null || project === filter);
    }
  };

  /**
   * Reorders the project groups within the container according to the active sorting strategy.
   */
  const reorder_groups = (container: Adw.PreferencesPage) => {
    const { mode, strategy } = taskSort.retrieve_sort_preferences();
    const sortedProjects = Array.from(projectGroups.keys()).sort(
      mode === SortingField.byProject
        ? taskSort.sort_by_project_name(strategy)
        : taskSort.sort_by_project_name(SortingStrategy.ascending),
    );

    for (const project of sortedProjects) {
      const taskGroup = projectGroups.get(project);
      if (taskGroup) {
        // We can still reorder in an AdwPreferencesPage by removing and adding
        // This relies on the fact that AdwPreferencesPage respects the order of additions
        container.remove(taskGroup);
        container.add(taskGroup);
      }
    }
  };

  /**
   * Bootstraps the project grouping system by connecting to signals and establishing initial layout.
   */
  const setup = (window: DoItMainWindow) => {
    const listContainer = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowListContainer,
    ) as Adw.PreferencesPage;

    projectManager.connect(AppSignals.ProjectAdded, (_: unknown, project: string) => {
      add_project_group(listContainer, project);
      // Apply current filter to new group
      const filter = projectManager.get_filter();
      if (filter !== null) {
        projectGroups.get(project)?.set_visible(project === filter);
      }
      reorder_groups(listContainer);
    });

    projectManager.connect(AppSignals.ProjectRemoved, (_: unknown, project: string) => {
      remove_project_group(listContainer, project);
    });

    projectManager.connect(AppSignals.FilterChanged, (_: unknown, filter: string | null) => {
      applyFilter(filter);
    });

    window.connect(AppSignals.SortingChanged, () => {
      reorder_groups(listContainer);
    });
  };

  return {
    setup,
  };
}
