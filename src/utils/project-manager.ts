import GObject from 'gi://GObject';
import { TaskListStore } from './list-store.js';
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
  private _projects: Set<string> = new Set();
  private _handler_id: number;
  private _current_filter: string | null = null;

  constructor(store: TaskListStore) {
    super();
    this._store = store;

    this._handler_id = this._store.connect('items-changed', this._update_projects.bind(this));
  }

  public set_filter(project: string | null) {
    if (this._current_filter === project) return;

    this._current_filter = project;
    this.emit('filter-changed', project);
  }

  public get_filter(): string | null {
    return this._current_filter;
  }

  public initialize() {
    this._update_projects();
  }

  private _update_projects() {
    const currentProjects = new Set<string>();
    const n_items = this._store.get_n_items();

    for (let i = 0; i < n_items; i++) {
        const task = this._store.get_item(i) as TaskItem;
        currentProjects.add(task.get_project() || "");
    }

    // Ensure the default "Tarefas" project always exists when completely empty
    if (n_items === 0) {
        currentProjects.add("");
    }

    // 1. Find projects to remove (exist in cache but not in current)
    for (const project of this._projects) {
        if (!currentProjects.has(project)) {
            this._projects.delete(project);
            this.emit('project-removed', project);
        }
    }

    // 2. Find projects to add (exist in current but not in cache)
    for (const project of currentProjects) {
        if (!this._projects.has(project)) {
            this._projects.add(project);
            this.emit('project-added', project);
        }
    }
  }

  public destroy() {
    this._store.disconnect(this._handler_id);
    this._projects.clear();
  }
}
