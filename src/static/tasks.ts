/* tasks.ts
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

/**
 * Symbolic icons used in the application.
 */
export const SymbolicIcons = {
  none: '',

  sidebar: {
    task_due: 'task-due-symbolic',
    folder: 'folder-symbolic',
    folder_open: 'folder-open-symbolic',
  },

  tasks: {
    trash_bin: 'user-trash-symbolic',
    undo: 'edit-undo-symbolic',
    new_task: 'appointment-new-symbolic',
  },

  sorting: {
    sort_ascending: 'view-sort-ascending-symbolic',
    sort_descending: 'view-sort-descending-symbolic',
  },
};

/**
 * Opacity values for task entry styles.
 */
export const TaskEntryOpacity = {
  enabled: 1,
  done: 0.6,
  deleted: 0.3,
} as const;

/**
 * Styles for task entries depending on their state.
 */
export const TaskEntryStyle: Record<string, { opacity: number }> = {
  enabled: {
    opacity: TaskEntryOpacity.enabled,
  },
  done: {
    opacity: TaskEntryOpacity.done,
  },
  deleted: {
    opacity: TaskEntryOpacity.deleted,
  },
};

/**
 * Icons used for the task delete/undo button.
 */
export const TaskDeleteButtonIcon = {
  default: SymbolicIcons.tasks.trash_bin,
  deleted: SymbolicIcons.tasks.undo,
};
