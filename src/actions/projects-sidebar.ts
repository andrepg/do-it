/* projects-sidebar.ts
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
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import { AppSignals, WidgetIds } from '~/app.enums.js';

import { DoItMainWindow } from '../views/doit.js';

import { ProjectManager } from '~/managers/project-manager.js';

/**
 * Initializes and manages the sidebar list of discovered projects.
 *
 * @param projectManager The global ProjectManager instance used to listen for project changes.
 */
export default function projectSidebar(projectManager: ProjectManager) {
  const ALL_TASKS = '__all__';

  /**
   * Bootstraps the sidebar tracking by connecting it to the project manager signals.
   */
  const setup = (window: DoItMainWindow) => {
    const sidebarProjectList = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowSidebarProjectList,
    ) as Gtk.Box;

    projectManager.connect(AppSignals.ProjectAdded, watch_changes);
    projectManager.connect(AppSignals.ProjectRemoved, watch_changes);
    projectManager.connect(AppSignals.FilterChanged, set_active_state);

    const sidebar = new Adw.Sidebar()
    
  };

  const watch_changes = () => {
    console.log(`[action] Projects changed`);
  };

  const set_active_state = () => {
    
  }

  return { setup };
}
