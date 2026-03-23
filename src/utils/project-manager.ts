/* project-manager.ts
 * Copyright 2025 André Paul Grandsire
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';

import { AppSignals } from '~/app.enums.js';

import { TaskItem } from '~/ui-handler/task-item.js';
import { TaskListStore } from '~/ui-handler/task-list-store.js';

/**
 * Manages the dynamic discovery of task groups based on projects in the store.
 *
 * Emits signals when a new project is found or an existing project no longer has any tasks.
 */
export class ProjectManager extends GObject.Object {
  static {
    GObject.registerClass(
      {
        GTypeName: 'ProjectManager',
        Signals: {
          [AppSignals.ProjectAdded]: {
            param_types: [GObject.TYPE_STRING],
          },
          [AppSignals.ProjectRemoved]: {
            param_types: [GObject.TYPE_STRING],
          },
          [AppSignals.FilterChanged]: {
            param_types: [GObject.TYPE_STRING],
          },
        },
      },
      this,
    );
  }

  private _store: TaskListStore;
  private _projects_set: Set<string> = new Set();
  private _projects_ordered: string[] = [];
  private _update_queued = false;
  private _handler_id: number;
  private _current_filter: string | null = null;

  constructor(store: TaskListStore) {
    super();
    this._store = store;

    this._handler_id = this._store.connect(AppSignals.ItemsChanged, () => this._update_projects());
  }

  /**
   * Retrieves the current ordered list of discovered projects.
   */
  public get_projects(): string[] {
    return this._projects_ordered;
  }

  /**
   * Sets the active project filter and emits the 'filter-changed' signal if changed.
   *
   * @param project The name of the project to filter by, or null for all tasks.
   */
  public set_filter(project: string | null) {
    if (this._current_filter === project) return;

    this._current_filter = project;
    this.emit(AppSignals.FilterChanged, project);
  }

  /**
   * Retrieves the current active project filter.
   */
  public get_filter(): string | null {
    return this._current_filter;
  }

  /**
   * Forces a refresh of the discovered projects by rescanning the store.
   */
  public refresh_items() {
    this._update_projects();
  }

  private _update_projects() {
    if (this._update_queued) return;
    this._update_queued = true;

    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this._do_update_projects();
      this._update_queued = false;
      return GLib.SOURCE_REMOVE;
    });
  }

  private _do_update_projects() {
    const currentProjectsSet = new Set<string>();
    const currentProjectsOrdered: string[] = [];
    const n_items = this._store.get_n_items();

    for (let i = 0; i < n_items; i++) {
      const item = this._store.get_item(i);
      if (item instanceof TaskItem) {
        const project = item.get_project() || '';
        if (!currentProjectsSet.has(project)) {
          currentProjectsSet.add(project);
          currentProjectsOrdered.push(project);
        }
      }
    }

    // 1. Find projects to remove (exist in cache but not in current)
    const projectsToRemove = [...this._projects_set].filter((p) => !currentProjectsSet.has(p));
    for (const project of projectsToRemove) {
      this._projects_set.delete(project);
      this.emit(AppSignals.ProjectRemoved, project);
    }

    // 2. Find projects to add (exist in current but not in cache)
    for (const project of currentProjectsOrdered) {
      if (!this._projects_set.has(project)) {
        this._projects_set.add(project);
        this.emit(AppSignals.ProjectAdded, project);
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
