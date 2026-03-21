import Adw from "gi://Adw";
import type { DoItMainWindow } from "../ui-handler/doit.js";
import { TaskListStore } from "../utils/list-store.js";
import { ProjectManager } from "../utils/project-manager.js";
import Gtk40 from "gi://Gtk";
import { SidebarButton } from "../ui-handler/sidebar-button.js";

// Declare _ global for translation
declare function _(id: string): string;

export default function projectSidebar(store: TaskListStore, projectManager: ProjectManager) {
    const projectSidebarItems: Map<string, SidebarButton> = new Map();

    const add_sidebar_item = (section: any, project: string) => {
        if (projectSidebarItems.has(project)) return;

        const sidebarItem = new SidebarButton(project);

        section.append(sidebarItem);
        projectSidebarItems.set(project, sidebarItem);

        // Connect activation to filter
        sidebarItem.connect('clicked', () => {
            console.log("Filtering project", project);
            projectManager.set_filter(project);
        });
    }

    const remove_sidebar_item = (section: any, project: string) => {
        const item = projectSidebarItems.get(project);

        if (item) {
            section.remove(item);
            projectSidebarItems.delete(project);
        }
    }

    const setup = (window: DoItMainWindow) => {
        const sidebarProjectList = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_project_list'
        ) as any;

        const sidebarBtnAll = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_btn_all'
        ) as any;

        if (sidebarBtnAll) sidebarBtnAll.connect('clicked', () => {
            projectManager.set_filter(null);
        });


        projectManager.connect('project-added', (_: unknown, project: string) => {
            add_sidebar_item(sidebarProjectList, project);
        });

        projectManager.connect('project-removed', (_: unknown, project: string) => {
            remove_sidebar_item(sidebarProjectList, project);
        });
    }

    return { setup };
}