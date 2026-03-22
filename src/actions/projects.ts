import type { DoItMainWindow } from '../ui-handler/doit.js';

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { log } from '../utils/log-manager.js';
import { ProjectManager } from '../utils/project-manager.js';
import { TaskGroup } from '../ui-handler/task-group.js';
import { TaskListStore } from '../ui-handler/task-list-store.js';
import { useTaskSort } from '../hooks/tasks.sort.js';
import { SortingField } from '../app.enums.js';

/**
 * Initializes and manages the grouping of tasks by project in the main view.
 * 
 * @param store The global TaskListStore.
 * @param projectManager The global ProjectManager instance.
 */
export default function projects(store: TaskListStore, projectManager: ProjectManager) {

    const projectGroups: Map<string, TaskGroup> = new Map();
    const taskSort = useTaskSort();

    const create_task_group = (project: string) => new TaskGroup(project, store);

    /**
     * Appends a new project group to the main list container.
     */
    const add_project_group = (container: Gtk.Box, project: string) => {
        if (projectGroups.has(project)) {
            return;
        }

        const taskGroup = create_task_group(project);
        projectGroups.set(project, taskGroup);

        container.append(taskGroup);
    }

    /**
     * Removes an existing project group from the main list container.
     */
    const remove_project_group = (container: Gtk.Box, project: string) => {
        if (!projectGroups.has(project)) return;

        const taskGroup = projectGroups.get(project);

        if (taskGroup) {
            container.remove(taskGroup);
            projectGroups.delete(project);
        }
    }

    /**
     * Sets the visibility of each project group based on the currently active filter.
     */
    const applyFilter = (filter: string | null) => {
        for (const [project, taskGroup] of projectGroups.entries()) {
            taskGroup.set_visible(
                filter === null || project === filter
            );
        }
    };

    /**
     * Reorders the project groups within the container according to the active sorting strategy.
     */
    const reorder_groups = (container: Gtk.Box) => {
        const { mode, strategy } = taskSort.retrieve_sort_preferences();
        const comparatorOrder = (mode === SortingField.byProject) ? strategy : 0;
        const sortedProjects = Array.from(projectGroups.keys())
            .sort(taskSort.sort_by_project_name(comparatorOrder));

        for (const project of sortedProjects) {
            const taskGroup = projectGroups.get(project);
            if (taskGroup) {
                // In GTK 4, to reorder children in a Box we can remove and append in the desired order
                container.remove(taskGroup);
                container.append(taskGroup);
            }
        }
    }

    /**
     * Bootstraps the project grouping system by connecting to signals and establishing initial layout.
     */
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
            reorder_groups(listContainer);
        });

        projectManager.connect('project-removed', (_: unknown, project: string) => {
            remove_project_group(listContainer, project);
        });

        projectManager.connect('filter-changed', (_: unknown, filter: string | null) => {
            applyFilter(filter);
        });

        window.connect('sorting-changed', () => {
            reorder_groups(listContainer);
        });
    }

    return {
        setup,
    };
}
