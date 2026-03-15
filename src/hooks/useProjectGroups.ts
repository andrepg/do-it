import Gtk from 'gi://Gtk';

import { TaskGroup } from '../ui-handler/task-group.js';
import { log } from '../utils/log-manager.js';
import type { TaskListStore } from '../utils/list-store.js';

/**
 * Hook to manage the dynamic creation and destruction of task groups based on projects.
 * 
 * This hook listens to changes in the TaskListStore and creates or removes TaskGroup 
 * instances as needed. It attaches the groups to the provided GTK container.
 * 
 * @param container - The parent container where `TaskGroup` instances will be appended or removed.
 * @param store - The TaskListStore that holds and manages all tasks.
 * @returns An object containing a `destroy` method to cleanly disconnect signals and remove groups.
 */
export function useProjectGroups(container: Gtk.Box, store: TaskListStore) {
  const projectLists: Map<string, TaskGroup> = new Map();

  const handleUpdateGroups = () => {
    const projects = new Set<string>();

    // Determine all unique projects currently in the store
    for (let i = 0; i < store.get_n_items(); i++) {
      const task = store.get_item(i) as any;
      if (task && typeof task.get_project === 'function') {
        projects.add(task.get_project() || "");
      }
    }

    // Add default empty project if no projects exist
    if (projects.size === 0) {
      projects.add("");
    }

    // Add any new projects
    projects.forEach(project => {
      if (!projectLists.has(project)) {
        log('window', `Creating project group: '${project}'`);
        
        const taskGroup = new TaskGroup(project, store);
        container.append(taskGroup);
        projectLists.set(project, taskGroup);
      }
    });

    // Remove unneeded projects
    for (const [project, taskGroup] of projectLists.entries()) {
      if (!projects.has(project)) {
        // Keep empty default group if the list is completely empty
        if (project === "" && projects.size === 0) continue; 
        
        container.remove(taskGroup);
        projectLists.delete(project);
      }
    }
  };

  const handler_id = store.connect('items-changed', handleUpdateGroups);

  // Initial population of groups
  handleUpdateGroups();

  return {
    destroy: () => {
      store.disconnect(handler_id);
      for (const taskGroup of projectLists.values()) {
        container.remove(taskGroup);
      }
      projectLists.clear();
    }
  };
}
