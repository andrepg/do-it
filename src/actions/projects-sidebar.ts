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

export default function projectSidebar(projectManager: ProjectManager) {
    const projectSidebarItems: Map<string, SidebarButton> = new Map();
    const taskSort = useTaskSort();

    const create_sidebar_button = (project: string): SidebarButton => new SidebarButton(project);

    const add_sidebar_item = (section: Gtk40.Box, project: string) => {
        if (projectSidebarItems.has(project)) return;

        const sidebarItem = create_sidebar_button(project);

        section.append(sidebarItem);
        projectSidebarItems.set(project, sidebarItem);

        sidebarItem.connect('clicked', () => {
            projectManager.set_filter(project);
        });
    }

    const remove_sidebar_item = (section: Gtk40.Box, project: string) => {
        const item = projectSidebarItems.get(project);

        if (item) {
            section.remove(item);
            projectSidebarItems.delete(project);
        }
    }

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