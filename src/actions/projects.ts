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

import { AppSignals, WidgetIds } from '~/app.enums.js';
import { DoItMainWindow } from '../views/doit.js';
import { TaskList } from '../views/task-list.js';
import { TaskListStore } from '~/persistence/list-store.js';
import { ProjectManager } from '~/managers/project-manager.js';

/**
 * Initializes the project-grouped task list in the main view.
 *
 * A single TaskList renders one PreferencesGroup per project dynamically,
 * listening to the store directly. This action only wires it to the container
 * and forwards the active project filter.
 *
 * @param store The global TaskListStore.
 * @param projectManager The global ProjectManager instance.
 */
export default function projects(store: TaskListStore, projectManager: ProjectManager) {
  const setup = (window: DoItMainWindow) => {
    const listContainer = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowListContainer,
    ) as Adw.PreferencesPage;

    const taskList = new TaskList(store, listContainer);

    projectManager.connect(AppSignals.FilterChanged, (_: unknown, filter: string | null) => {
      taskList.set_filter(filter);
    });
  };

  return {
    setup,
  };
}
