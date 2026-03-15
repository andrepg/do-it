import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ProjectManager } from '../utils/project-manager.js';
import { TaskGroup } from '../ui-handler/task-group.js';
import { SidebarButton } from '../ui-handler/sidebar-button.js';
import { log } from '../utils/log-manager.js';
import type { DoItMainWindow } from '../ui-handler/doit.js';
import Gio20 from 'gi://Gio';
import { TaskListStore } from '../utils/list-store.js';

export default function projects() {
    let projectManager: ProjectManager;
    let listContainer: Gtk.Box;
    let sidebarProjectList: Gtk.ListBox;

    let currentFilter: string | null = null;

    const projectGroups: Map<string, TaskGroup> = new Map();
    const projectSidebarBtns: Map<string, Gtk.Button> = new Map();

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

        sidebarProjectList = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_project_list'
        ) as Gtk.ListBox;

        const sidebarBtnAll = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_btn_all'
        ) as Adw.ButtonRow;

        sidebarBtnAll.connect('activated', () => applyFilter(null));

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

            // 2. Create sidebar button
            const btnRow = new SidebarButton(project);

            btnRow.connect('clicked', () => applyFilter(project));

            sidebarProjectList.append(btnRow);
            projectSidebarBtns.set(project, btnRow);

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

            const btn = projectSidebarBtns.get(project);
            if (btn) {
                sidebarProjectList.remove(btn);
                projectSidebarBtns.delete(project);
            }

            // Fallback to viewing all if current filter was deleted
            if (currentFilter === project) {
                applyFilter(null);
            }
        });
    }

    return { setup };
}
