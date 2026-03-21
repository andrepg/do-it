import type { DoItMainWindow } from '../ui-handler/doit.js';

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { log } from '../utils/log-manager.js';
import { ProjectManager } from '../utils/project-manager.js';
import { TaskGroup } from '../ui-handler/task-group.js';
import { TaskListStore } from '../utils/list-store.js';

export default function projects(store: TaskListStore, projectManager: ProjectManager) {

    const projectGroups: Map<string, TaskGroup> = new Map();

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

    const applyFilter = (filter: string | null) => {
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

        projectManager.connect('project-added', (_: unknown, project: string) => {
            add_project_group(listContainer, project);
            // Apply current filter to new group
            const filter = projectManager.get_filter();
            if (filter !== null) {
                projectGroups.get(project)?.set_visible(project === filter);
            }
        });

        projectManager.connect('project-removed', (_: unknown, project: string) => {
            remove_project_group(listContainer, project);
        });

        projectManager.connect('filter-changed', (_: unknown, filter: string | null) => {
            applyFilter(filter);
        });
    }

    return {
        setup,
    };
}
