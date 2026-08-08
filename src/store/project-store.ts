/* project-store.ts
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
import Gtk from 'gi://Gtk';

import { AppSignals } from '~/app.enums.js';

import { TaskItem } from '~/views/task-item.js';
import { TaskListStore } from '~/store/list-store.js';

/**
 * Stores the list of projects discovered from the task store.
 *
 * Keeps a Gtk.StringList with the discovered project names and emits
 * signals when a project is added, removed or the active filter changes.
 */
export class ProjectStore extends GObject.Object {
  static {
    GObject.registerClass(
      {
        GTypeName: 'ProjectStore',
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

  /**
   * The list of discovered project names, kept in sync with the task store.
   */
  public readonly projects: Gtk.StringList = new Gtk.StringList();

  private static instance: ProjectStore | null = null;

  private _store = TaskListStore.get_default();
  private _projects_ordered: string[] = [];
  private _update_queued = false;
  private _current_filter: string | null = null;

  /**
   * Returns the app-wide ProjectStore singleton.
   */
  static get_default(): ProjectStore {
    return (this.instance ??= new ProjectStore());
  }

  constructor() {
    super();

    this._store.connect(AppSignals.ItemsChanged, () => this._update_projects());
    this._store.connect(AppSignals.TaskUpdated, () => this._update_projects());
    this._store.connect(AppSignals.TaskDeleted, () => this._update_projects());

    // Synchronize with tasks already loaded before this store was created,
    // so the sidebar renders the projects on the first paint.
    this._update_projects();
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
   * Retrieves all discovered project names.
   */
  public get_projects(): string[] {
    const projects: string[] = [];

    for (let i = 0; i < this.projects.get_n_items(); i++) {
      const project = this.projects.get_string(i);
      if (project !== null) projects.push(project);
    }

    return projects;
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
    const currentProjectsOrdered: string[] = [];
    const currentProjectsSet = new Set<string>();
    const n_items = this._store.get_count();

    for (let i = 0; i < n_items; i++) {
      const item = this._store.get_item(i);
      if (item instanceof TaskItem) {
        const project = item.project || '';
        if (!currentProjectsSet.has(project)) {
          currentProjectsSet.add(project);
          currentProjectsOrdered.push(project);
        }
      }
    }

    // Find projects to remove (previously discovered but no longer present)
    for (const project of this._projects_ordered) {
      if (!currentProjectsSet.has(project)) {
        this.emit(AppSignals.ProjectRemoved, project);
      }
    }

    // Find projects to add (present now but not yet discovered)
    for (const project of currentProjectsOrdered) {
      if (!this._projects_ordered.includes(project)) {
        this.emit(AppSignals.ProjectAdded, project);
      }
    }

    // Mirror the named projects into the string list, excluding the
    // 'without project' entry which is handled separately by the UI
    this.projects.splice(
      0,
      this.projects.get_n_items(),
      currentProjectsOrdered.filter((project) => project !== ''),
    );

    this._projects_ordered = currentProjectsOrdered;
  }
}
