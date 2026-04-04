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
import { DoItMainWindow } from '../views/doit.js';
import { TaskGroup } from '../views/task-group.js';
import { TaskListStore } from '../views/task-list-store.js';
import { ProjectManager } from '~/utils/project-manager.js';
import {
  add_project_group,
  applyFilter,
  remove_project_group,
  reorder_groups,
} from './projects-utils.js';

/**
 * Initializes and manages the grouping of tasks by project in the main view.
 *
 * @param store The global TaskListStore.
 * @param projectManager The global ProjectManager instance.
 */
export default function projects(store: TaskListStore, projectManager: ProjectManager) {
  const projectGroups: Map<string, TaskGroup> = new Map();

  const setup = (window: DoItMainWindow) => {
    const listContainer = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowListContainer,
    ) as Adw.PreferencesPage;

    projectManager.connect(AppSignals.ProjectAdded, (_: unknown, project: string) => {
      add_project_group(listContainer, project, projectGroups, store);
      const filter = projectManager.get_filter();
      if (filter !== null) {
        projectGroups.get(project)?.set_visible(project === filter);
      }
      reorder_groups(listContainer, projectGroups);
    });

    projectManager.connect(AppSignals.ProjectRemoved, (_: unknown, project: string) => {
      remove_project_group(listContainer, project, projectGroups);
    });

    projectManager.connect(AppSignals.FilterChanged, (_: unknown, filter: string | null) => {
      applyFilter(projectGroups, filter);
    });

    window.connect(AppSignals.SortingChanged, () => {
      reorder_groups(listContainer, projectGroups);
    });
  };

  return {
    setup,
  };
}
