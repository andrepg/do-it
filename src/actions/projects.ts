import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ProjectManager } from '../utils/project-manager.js';
import { TaskGroup } from '../ui-handler/task-group.js';
import { log } from '../utils/log-manager.js';
import type { DoItMainWindow } from '../ui-handler/doit.js';

export default function projects() {
    let currentFilter: string | null = null;
    const projectGroups: Map<string, TaskGroup> = new Map();
    const projectSidebarBtns: Map<string, Adw.ButtonRow> = new Map();

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
        const listContainer = window.get_template_child(
            (window.constructor as any).GType,
            'list_container'
        ) as Gtk.Box;

        const sidebarProjectList = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_project_list'
        ) as Gtk.ListBox;

        const sidebarBtnAll = window.get_template_child(
            (window.constructor as any).GType,
            'sidebar_btn_all'
        ) as Adw.ButtonRow;

        sidebarBtnAll.connect('activated', () => applyFilter(null));

        const projectManager = new ProjectManager(window.taskListStore);

        projectManager.connect('project-added', (_, project: string) => {
            log('projects-action', `Creating project UI: '${project}'`);

            // 1. Create main container TaskGroup
            const taskGroup = new TaskGroup(project, window.taskListStore);
            listContainer.append(taskGroup);
            projectGroups.set(project, taskGroup);

            // 2. Create sidebar button
            const btnTitle = project === "" ? "Tarefas" : project;
            const btnIcon = project === "" ? "task-due-symbolic" : "folder-open-symbolic";
            
            const btnRow = new Adw.ButtonRow({
                title: btnTitle,
                start_icon_name: btnIcon,
            });

            btnRow.connect('activated', () => applyFilter(project));

            sidebarProjectList.append(btnRow);
            projectSidebarBtns.set(project, btnRow);

            applyFilter(currentFilter);
        });

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

        projectManager.initialize();
    };

    return { setup };
}
