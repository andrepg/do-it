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

import { DoItMainWindow } from '../views/doit.js';

import { ProjectStore } from '~/store/project-store.js';
import { GeneralSectionItems, SidebarFilterDataKey } from '~/static/sidebar.js';

/**
 * Initializes the sidebar with the list of projects.
 *
 * Builds an AdwSidebar with a fixed section for all tasks and tasks without
 * a project, plus a section bound to the projects discovered by the store.
 *
 * @param projectStore The global ProjectStore instance used to list projects and filter tasks.
 */
export default function projectSidebar(projectStore: ProjectStore) {
  let sidebar!: Adw.Sidebar;

  /**
   *
   * @returns
   */
  const setup_general_section = () => {
    const section = new Adw.SidebarSection();

    GeneralSectionItems.forEach((item) => {
      const sidebarItem = new Adw.SidebarItem({
        icon_name: item.icon,
        title: item.title,
      });

      section.append(sidebarItem);

      sidebarItem.set_data(SidebarFilterDataKey, item.filter);
    });

    sidebar.append(section);

    return section;
  };

  const setup_projects_section = () => {
    const section = new Adw.SidebarSection();

    section.bind_model(projectStore.projects, (item: GObject.Object) => {
      const project = (item as Gtk.StringObject).string;
      const sidebarItem = new Adw.SidebarItem({ title: project });

      sidebarItem.set_data(SidebarFilterDataKey, project);

      return sidebarItem;
    });

    sidebar.append(section);

    return section;
  };

  /**
   * Updates the selected sidebar item based on the current filter.
   *
   * @param filter The current filter to update the selection based on.
   */
  const update_selection = (filter: string | null) => {
    const items = sidebar.get_items();

    for (let i = 0; i < items.get_n_items(); i++) {
      const item = sidebar.get_item(i);

      if (item && item.get_data(SidebarFilterDataKey) === filter) {
        sidebar.set_selected(i);
        return;
      }
    }

    sidebar.set_selected(Gtk.INVALID_LIST_POSITION);
  };

  const setup = (window: DoItMainWindow) => {
    sidebar = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowSidebarProjectList,
    ) as Adw.Sidebar;

    sidebar.remove_all();
    sidebar.append(setup_general_section());
    sidebar.append(setup_projects_section());

    // Forward activated items to the project store
    sidebar.connect(AppSignals.Activated, (_: Adw.Sidebar, index: number) => {
      const item = sidebar.get_item(index);
      const filter = item !== null ? (item.get_data(SidebarFilterDataKey) as string) : undefined;

      if (filter !== undefined) projectStore.set_filter(filter);
    });

    // Keep selection in sync with externally changed filters
    projectStore.connect(AppSignals.FilterChanged, update_selection);

    update_selection(projectStore.get_filter());
  };

  return { setup };
}
