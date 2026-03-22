import GObject from 'gi://GObject';
import { TaskListStore } from '../ui-handler/task-list-store.js';
import { TaskItem } from '../ui-handler/task-item.js';

/**
 * Manages the dynamic discovery of task groups based on projects in the store.
 * 
 * Emits signals when a new project is found or an existing project no longer has any tasks.
 */
export class ProjectManager extends GObject.Object {
  static {
    GObject.registerClass({
      GTypeName: 'ProjectManager',
      Signals: {
        'project-added': {
          param_types: [GObject.TYPE_STRING]
        },
        'project-removed': {
          param_types: [GObject.TYPE_STRING]
        },
        'filter-changed': {
          param_types: [GObject.TYPE_STRING]
        }
      }
    }, this);
  }

  private _store: TaskListStore;
  private _projects_set: Set<string> = new Set();
  private _projects_ordered: string[] = [];
  private _handler_id: number;
  private _current_filter: string | null = null;

  constructor(store: TaskListStore) {
    super();
    this._store = store;

    this._handler_id = this._store.connect('items-changed', this._update_projects.bind(this));
  }

  public get_projects(): string[] {
    return this._projects_ordered;
  }

  public set_filter(project: string | null) {
    if (this._current_filter === project) return;

    this._current_filter = project;
    this.emit('filter-changed', project);
  }

  public get_filter(): string | null {
    return this._current_filter;
  }

  public refresh_items() {
    this._update_projects();
  }

  private _update_projects() {
    const currentProjectsSet = new Set<string>();
    const currentProjectsOrdered: string[] = [];
    const n_items = this._store.get_n_items();

    for (let i = 0; i < n_items; i++) {
      const task = this._store.get_item(i) as TaskItem;
      const project = task.get_project() || "";
      if (!currentProjectsSet.has(project)) {
        currentProjectsSet.add(project);
        currentProjectsOrdered.push(project);
      }
    }

    // Ensure the default "All tasks" project always exists when completely empty
    if (n_items === 0) {
      currentProjectsSet.add("");
      currentProjectsOrdered.push("");
    }

    // 1. Find projects to remove (exist in cache but not in current)
    for (const project of this._projects_set) {
      if (!currentProjectsSet.has(project)) {
        this._projects_set.delete(project);
        this.emit('project-removed', project);
      }
    }

    // 2. Find projects to add (exist in current but not in cache)
    for (const project of currentProjectsOrdered) {
      if (!this._projects_set.has(project)) {
        this._projects_set.add(project);
        this.emit('project-added', project);
      }
    }

    this._projects_ordered = currentProjectsOrdered;
  }

  public destroy() {
    this._store.disconnect(this._handler_id);
    this._projects_set.clear();
    this._projects_ordered = [];
  }
}
