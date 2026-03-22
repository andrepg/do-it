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
import Adw from "gi://Adw";
import type { DoItMainWindow } from "../ui-handler/doit.js";
import { TaskListStore } from "../ui-handler/task-list-store.js";
import { ProjectManager } from "../utils/project-manager.js";
import Gtk40 from "gi://Gtk";
import { SidebarButton } from "../ui-handler/sidebar-button.js";

import { useTaskSort } from "../hooks/tasks.sort.js";
import { SortingStrategy } from "../app.enums.js";

// Declare _ global for translation
declare function _(id: string): string;

/**
 * Initializes and manages the sidebar list of discovered projects.
 * 
 * @param projectManager The global ProjectManager instance used to listen for project changes.
 */
export default function projectSidebar(projectManager: ProjectManager) {
    const projectSidebarItems: Map<string, SidebarButton> = new Map();
    const taskSort = useTaskSort();

    const create_sidebar_button = (project: string): SidebarButton => new SidebarButton(project);

    /**
     * Appends a new project to the sidebar list and binds its click event.
     * 
     * @param section The container where the item will be appended.
     * @param project The name of the project.
     */
    const add_sidebar_item = (section: Gtk40.Box, project: string) => {
        if (projectSidebarItems.has(project)) return;

        const sidebarItem = create_sidebar_button(project);

        section.append(sidebarItem);
        projectSidebarItems.set(project, sidebarItem);

        sidebarItem.connect('clicked', () => {
            projectManager.set_filter(project);
        });
    }

    /**
     * Removes a project from the sidebar list.
     * 
     * @param section The container from which the item will be removed.
     * @param project The name of the project to remove.
     */
    const remove_sidebar_item = (section: Gtk40.Box, project: string) => {
        const item = projectSidebarItems.get(project);

        if (item) {
            section.remove(item);
            projectSidebarItems.delete(project);
        }
    }

    /**
     * Reorders the sidebar items alphabetically to maintain a stable layout.
     * 
     * @param section The container whose children should be reordered.
     */
    const reorder_sidebar = (section: Gtk40.Box) => {
        const sortedProjects = Array.from(projectSidebarItems.keys())
            .filter(p => p !== "__all__")
            .sort(taskSort.sort_by_project_name(SortingStrategy.ascending));

        // Re-append items in order
        // Note: "__all__" is handled differently or we can just keep it at the top
        const allTasksBtn = projectSidebarItems.get("__all__");
        if (allTasksBtn) {
            section.remove(allTasksBtn);
            section.append(allTasksBtn);
        }

        for (const project of sortedProjects) {
            const sidebarItem = projectSidebarItems.get(project);
            if (sidebarItem) {
                section.remove(sidebarItem);
                section.append(sidebarItem);
            }
        }
    }

    /**
     * Bootstraps the sidebar tracking by connecting it to the project manager signals.
     */
    const setup = (window: DoItMainWindow) => {
        const sidebarProjectList = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_project_list'
        ) as Gtk40.Box;

        setup_all_tasks_button(sidebarProjectList);

        projectManager.connect('project-added', (_: unknown, project: string) => {
            add_sidebar_item(sidebarProjectList, project);
            reorder_sidebar(sidebarProjectList);
            update_active_states(projectManager.get_filter());
        });

        projectManager.connect('project-removed', (_: unknown, project: string) => {
            remove_sidebar_item(sidebarProjectList, project);
        });

        projectManager.connect('filter-changed', (_: unknown, filter: string | null) => {
            update_active_states(filter);
        });

        // Set initial state
        update_active_states(projectManager.get_filter());
    }

    function update_active_states(filter: string | null) {
        projectSidebarItems.forEach((btn, proj) => {
            if (proj === "__all__") {
                btn.set_active(filter === null);
            } else {
                btn.set_active(proj === filter);
            }
        });
    }

    function setup_all_tasks_button(sidebarProjectList: Gtk40.Box): void {
        const sidebarBtnAll = create_sidebar_button(_("All tasks"));

        sidebarBtnAll.connect('clicked', () => {
            projectManager.set_filter(null);
        });

        sidebarProjectList.append(sidebarBtnAll);
        projectSidebarItems.set("__all__", sidebarBtnAll);
    }

    return { setup };
}