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

const SortingStrings = {
  [SortingStrategy.ascending]: {
    [SortingField.byDate]: _('Older to newer'),
    [SortingField.byStatus]: _('To do first'),
    [SortingField.byTitle]: _('A to Z'),
    [SortingField.byProject]: _('A to Z'),
  },
  [SortingStrategy.descending]: {
    [SortingField.byDate]: _('Newer to older'),
    [SortingField.byStatus]: _('Done first'),
    [SortingField.byTitle]: _('Z to A'),
    [SortingField.byProject]: _('Z to A'),
  },

  fields: {
    [SortingField.byDate]: _('Date'),
    [SortingField.byStatus]: _('Status'),
    [SortingField.byTitle]: _('Title'),
    [SortingField.byProject]: _('Project'),
  },
};

const TaskStrings = {
  list: {
    title: _('Tasks'),
    empty: _('No tasks found'),
    all: _('All tasks'),
    noProject: _('Without project'),
  },

  form: {
    title: _('Task'),
    titlePlaceholder: _('Task title'),
    descriptionPlaceholder: _('Task description'),

    entryRowDone: _('Mark as done'),
    entryRowDelete: _('Mark as deleted'),

    buttonSave: _('Save'),
    buttonDiscard: _('Discard'),

    errorEmptyTitle: _('Title cannot be empty'),
  },

  toast: {
    created: _('Task created'),
    edited: _('Task edited'),
    updated: _('Task updated'),
    restored: _('Task restored'),
    softDeleted: _('Task deleted'),
    hardDeleted: _('Tasks purged'),
    finished: _('Task finished'),
  },
};

const AppStrings = {
  backup: {
    export: _('Export database'),
    import: _('Import database'),
  },
  about: {
    translatorCredits: _('translators-credits'),
  },
};

export const AppLocale = {
  app: AppStrings,

  tasks: TaskStrings,

  sorting: SortingStrings,

  projects: {},
};
