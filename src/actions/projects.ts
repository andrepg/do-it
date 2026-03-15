import type { DoItMainWindow } from '../ui-handler/doit.js';

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { log } from '../utils/log-manager.js';
import { ProjectManager } from '../utils/project-manager.js';
import { TaskGroup } from '../ui-handler/task-group.js';
import { TaskListStore } from '../utils/list-store.js';

export default function projects(store: TaskListStore) {
    const projectManager = new ProjectManager(store);

    const projectGroups: Map<string, TaskGroup> = new Map();

    // TODO We will implement sidebar based on this
    const projectSidebarItems: Map<string, any> = new Map();

    const create_task_group = (project: string) => new TaskGroup(project, store);

    const add_project_group = (container: Gtk.Box, project: string) => {
        if (projectGroups.has(project)) {
            return;
        }

        const taskGroup = create_task_group(project);
        projectGroups.set(project, taskGroup);

        container.append(taskGroup);
    }

    const remove_project_group = (container: Gtk.Box, project: string) => {
        if (!projectGroups.has(project)) return;

        const taskGroup = projectGroups.get(project);

        if (taskGroup) {
            container.remove(taskGroup);
            projectGroups.delete(project);
        }
    }

    const setup = (window: DoItMainWindow) => {
        const listContainer = window.get_template_child(
            (window.constructor as any).GType,
            'list_container'
        ) as Gtk.Box;

        projectManager.connect('project-added', (_: unknown, project: string) => {
            add_project_group(listContainer, project)
        });

        projectManager.connect('project-removed', (_: unknown, project: string) => {
            remove_project_group(listContainer, project)
        });

        projectManager.initialize();
    }

    return {
        setup,
    };
}

/*
export default function projects() {
    let projectManager: ProjectManager;
    let listContainer: Gtk.Box;
    let mainSidebar: any;
    let sectionProjects: any;
    let sidebarItemAll: any;

    let currentFilter: string | null = null;

    const projectGroups: Map<string, TaskGroup> = new Map();
    const projectSidebarItems: Map<string, any> = new Map();

    const applyFilter = (filter: string | null) => {
        log('projects-action', `Applying filter: ${filter}`);
        currentFilter = filter;

        for (const [project, taskGroup] of projectGroups.entries()) {
            if (filter === null) {
                taskGroup.set_visible(true);
            } else {
                taskGroup.set_visible(project === filter);
            }
        }
    };

    const setup = (window: DoItMainWindow) => {
        listContainer = window.get_template_child(
            (window.constructor as any).GType,
            'list_container'
        ) as Gtk.Box;

        sectionProjects = window.get_template_child(
            (window.constructor as any).GType,
            'section_projects'
        ) as any;

        mainSidebar = window.get_template_child(
            (window.constructor as any).GType,
            'main_sidebar'
        ) as any;

        sidebarItemAll = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_item_all'
        ) as any;

        mainSidebar.connect('activated', (_: any, item: any) => {
            if (item === sidebarItemAll) {
                applyFilter(null);
            } else {
                for (const [project, sidebarItem] of projectSidebarItems.entries()) {
                    if (sidebarItem === item) {
                        applyFilter(project);
                        break;
                    }
                }
            }
        });

        projectManager = new ProjectManager(window.taskListStore);

        connect_project_added(window.taskListStore);
        connect_project_removed();

        projectManager.initialize();
    };

    const connect_project_added = (taskListStore: TaskListStore) => {
        projectManager.connect('project-added', (_, project: string) => {
            log('projects-action', `Creating project UI: '${project}'`);

            // 1. Create main container TaskGroup
            const taskGroup = new TaskGroup(project, taskListStore);
            listContainer.append(taskGroup);
            projectGroups.set(project, taskGroup);

            // 2. Create sidebar item
            const sidebarItem = new (Adw as any).SidebarItem({
                title: project === "" ? _("Tarefas") : project,
                icon_name: project === "" ? "task-due-symbolic" : "folder-open-symbolic"
            });

            sectionProjects.append(sidebarItem);
            projectSidebarItems.set(project, sidebarItem);

            applyFilter(currentFilter);
        });
    }

    const connect_project_removed = () => {
        projectManager.connect('project-removed', (_, project: string) => {
            log('projects-action', `Removing project UI: '${project}'`);
            
            const group = projectGroups.get(project);
            if (group) {
                listContainer.remove(group);
                projectGroups.delete(project);
            }

            const item = projectSidebarItems.get(project);
            if (item) {
                sectionProjects.remove(item);
                projectSidebarItems.delete(project);
            }

            // Fallback to viewing all if current filter was deleted
            if (currentFilter === project) {
                applyFilter(null);
            }
        });
    }

    return { setup };
}
*/