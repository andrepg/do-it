/* sidebar.ts
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
import { AppLocale } from '~/app.strings.js';
import { SymbolicIcons } from '~/static/tasks.js';

/**
 * Magic filters used to filter out projects and tasks.
 *
 * Using a string value allows us to use it both as a magic value for the project name
 * (which is never a magic value) and as a filter value. And since it's a string,
 * it can be appended in the same store as the project names.
 */
export const MagicFilters = {
  all: '__ALL__',
  none: '__NONE__',
} as const;

/**
 * Defines the items that will be present in the general section of the sidebar.
 * Fixed and predefined by us, such as ALL_PROJECTS and NO_PROJECTS.
 */
export const GeneralSectionItems = [
  {
    icon: SymbolicIcons.sidebar.folder,
    title: AppLocale.tasks.list.all,
    filter: MagicFilters.all,
  },
  {
    icon: SymbolicIcons.sidebar.task_due,
    title: AppLocale.tasks.list.noProject,
    filter: MagicFilters.none,
  },
];
