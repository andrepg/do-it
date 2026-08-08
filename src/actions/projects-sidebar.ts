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
import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { AppSignals, WidgetIds } from '~/app.enums.js';
import { AppLocale } from '~/app.strings.js';

import { DoItMainWindow } from '../views/doit.js';

import { ProjectStore } from '~/store/project-store.js';

/**
 * Initializes the sidebar with the list of projects.
 *
 * Builds an AdwSidebar with a fixed section for all tasks and tasks without
 * a project, plus a section bound to the projects discovered by the store.
 *
 * @param projectStore The global ProjectStore instance used to list projects and filter tasks.
 */
export default function projectSidebar(projectStore: ProjectStore) {
  const setup = (window: DoItMainWindow) => {
    const sidebar = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowSidebarProjectList,
    ) as Adw.Sidebar;

    // Maps each sidebar item to the project filter it represents
    const filterByItem = new Map<Adw.SidebarItem, string | null>();

    // Fixed section: all tasks and tasks without a project
    const generalSection = new Adw.SidebarSection();

    const allTasksItem = new Adw.SidebarItem({
      title: AppLocale.tasks.list.all,
    });
    filterByItem.set(allTasksItem, null);

    const noProjectItem = new Adw.SidebarItem({
      title: AppLocale.tasks.list.noProject,
    });
    filterByItem.set(noProjectItem, '');

    generalSection.append(allTasksItem);
    generalSection.append(noProjectItem);
    sidebar.append(generalSection);

    // Dynamic section: one item per discovered project, kept in sync with the store
    const projectsSection = new Adw.SidebarSection();

    projectsSection.bind_model(projectStore.projects, (item: GObject.Object) => {
      const project = (item as Gtk.StringObject).string;
      const sidebarItem = new Adw.SidebarItem({ title: project });

      filterByItem.set(sidebarItem, project);
      return sidebarItem;
    });

    sidebar.append(projectsSection);

    const update_selection = (filter: string | null) => {
      const items = sidebar.get_items();

      for (let i = 0; i < items.get_n_items(); i++) {
        const item = sidebar.get_item(i);

        if (item && filterByItem.get(item) === filter) {
          sidebar.set_selected(i);
          return;
        }
      }

      sidebar.set_selected(Gtk.INVALID_LIST_POSITION);
    };

    // Forward activated items to the project store
    sidebar.connect(AppSignals.Activated, (_: Adw.Sidebar, index: number) => {
      const item = sidebar.get_item(index);
      const filter = item !== null ? filterByItem.get(item) : undefined;

      if (filter !== undefined) projectStore.set_filter(filter);
    });

    // Keep selection in sync with externally changed filters
    projectStore.connect(AppSignals.FilterChanged, update_selection);

    update_selection(projectStore.get_filter());
  };

  return { setup };
}
