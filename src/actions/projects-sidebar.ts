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
import { GeneralSectionItems } from '~/static/sidebar.js';

/**
 * A sidebar item carrying the filter value it represents.
 *
 * The filter is stored as an expando property, since GJS data access
 * methods (set_data/get_data) are unsupported and throw at runtime.
 */
type FilteredSidebarItem = Adw.SidebarItem & { filter?: string };

/**
 * Builds the fixed section with all tasks and tasks without a project.
 *
 * @returns The general section ready to be appended to the sidebar.
 */
const create_general_section = (): Adw.SidebarSection => {
  const section = new Adw.SidebarSection();

  GeneralSectionItems.forEach((item) => {
    const sidebarItem = new Adw.SidebarItem({
      icon_name: item.icon,
      title: item.title,
    }) as FilteredSidebarItem;

    sidebarItem.filter = item.filter;

    section.append(sidebarItem);
  });

  return section;
};

/**
 * Builds the section bound to the projects discovered by the store.
 *
 * @param projectStore The project store exposing the discovered projects.
 * @returns The projects section ready to be appended to the sidebar.
 */
const create_projects_section = (projectStore: ProjectStore): Adw.SidebarSection => {
  const section = new Adw.SidebarSection();

  section.bind_model(projectStore.projects, (item: GObject.Object) => {
    const project = (item as Gtk.StringObject).string;
    const sidebarItem = new Adw.SidebarItem({ title: project }) as FilteredSidebarItem;

    sidebarItem.filter = project;

    return sidebarItem;
  });

  return section;
};

/**
 * Reads the filter value carried by a sidebar item.
 *
 * @param item The sidebar item holding the filter value.
 * @returns The filter value, or null when the item has no filter set.
 */
const read_filter = (item: Adw.SidebarItem): string | null =>
  (item as FilteredSidebarItem).filter ?? null;

/**
 * Updates the selected sidebar item based on the current filter.
 *
 * @param sidebar The sidebar to update the selection on.
 * @param filter The current filter to select the matching item for.
 */
const update_selection = (sidebar: Adw.Sidebar, filter: string | null) => {
  const count = sidebar.get_items().get_n_items();

  for (let i = 0; i < count; i++) {
    const item = sidebar.get_item(i);

    if (item && read_filter(item) === filter) {
      sidebar.set_selected(i);
      return;
    }
  }

  // If no item is found, deselect all items with INVALID_LIST_POSITION from GTK.
  sidebar.set_selected(Gtk.INVALID_LIST_POSITION);
};

/**
 * Initializes the sidebar with the list of projects.
 *
 * Builds an AdwSidebar with a fixed section for all tasks and tasks without
 * a project, plus a section bound to the projects discovered by the store.
 * Each item carries its filter value as an expando property, keeping
 * selection in sync with the store filter.
 *
 * @param projectStore The global ProjectStore instance used to list projects and filter tasks.
 */
export default function projectSidebar(projectStore: ProjectStore) {
  const setup = (window: DoItMainWindow) => {
    const sidebar = window.get_template_child(
      DoItMainWindow.$gtype,
      WidgetIds.WindowSidebarProjectList,
    ) as Adw.Sidebar;

    sidebar.remove_all();
    sidebar.append(create_general_section());
    sidebar.append(create_projects_section(projectStore));

    // Forward activated items to the project store
    sidebar.connect(AppSignals.Activated, (_: Adw.Sidebar, index: number) => {
      const item = sidebar.get_item(index);
      const filter = item !== null ? read_filter(item) : null;

      if (filter !== null) projectStore.set_filter(filter);
    });

    // Keep selection in sync with externally changed filters
    projectStore.connect(AppSignals.FilterChanged, (_store: ProjectStore, filter: string | null) =>
      update_selection(sidebar, filter),
    );

    update_selection(sidebar, projectStore.get_filter());
  };

  return { setup };
}
