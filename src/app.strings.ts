/* app.strings.ts
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

import { SortingField, SortingStrategy } from './app.enums.js';

pkg.initGettext();

const SortingStrings = {
  [SortingStrategy.ascending]: {
    [SortingField.byDate]: C_('sorting', 'Older to newer'),
    [SortingField.byStatus]: C_('sorting', 'To do first'),
    [SortingField.byTitle]: C_('sorting', 'A to Z'),
    [SortingField.byProject]: C_('sorting', 'A to Z'),
  },
  [SortingStrategy.descending]: {
    [SortingField.byDate]: C_('sorting', 'Newer to older'),
    [SortingField.byStatus]: C_('sorting', 'Done first'),
    [SortingField.byTitle]: C_('sorting', 'Z to A'),
    [SortingField.byProject]: C_('sorting', 'Z to A'),
  },

  fields: {
    [SortingField.byDate]: C_('sorting-field', 'Date'),
    [SortingField.byStatus]: C_('sorting-field', 'Status'),
    [SortingField.byTitle]: C_('sorting-field', 'Title'),
    [SortingField.byProject]: C_('sorting-field', 'Project'),
  },
};

const TaskStrings = {
  list: {
    title: C_('task-list', 'Tasks'),
    empty: C_('task-list', 'No tasks found'),
    all: C_('task-list', 'All tasks'),
    noProject: C_('task-list', 'Without project'),
    groupDescription: C_('task-group', '%s finished, %s deleted'),
  },

  form: {
    title: C_('task-form', 'Task'),
    titlePlaceholder: C_('task-form', 'Task title'),
    descriptionPlaceholder: C_('task-form', 'Task description'),

    entryRowDone: C_('task-form', 'Mark as done'),
    entryRowDelete: C_('task-form', 'Mark as deleted'),

    buttonSave: C_('task-form', 'Save'),
    buttonDiscard: C_('task-form', 'Discard'),

    errorEmptyTitle: C_('task-form', 'Title cannot be empty'),
  },

  toast: {
    created: C_('toast', 'Task created'),
    edited: C_('toast', 'Task edited'),
    updated: C_('toast', 'Task updated'),
    restored: C_('toast', 'Task restored'),
    softDeleted: C_('toast', 'Task deleted'),
    hardDeleted: C_('toast', 'Tasks purged'),
    finished: C_('toast', 'Task finished'),
  },
};

const AppStrings = {
  backup: {
    export: C_('backup', 'Export database'),
    import: C_('backup', 'Import database'),

    exportSuccess: C_('backup', 'Database exported successfully'),
    exportError: C_('backup', 'Error exporting database'),

    importSuccess: C_('backup', 'Database imported successfully'),
    importError: C_('backup', 'Error importing database'),
  },
  about: {
    translatorCredits: C_('about', 'translators-credits'),
    donate: C_('about', 'Donate'),
  },
};

export const AppLocale = {
  app: AppStrings,

  tasks: TaskStrings,

  sorting: SortingStrings,
};
