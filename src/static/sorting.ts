/* sorting.ts
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
import { ISortingFieldOption, ISortingStrategyOption } from '~/app.types.js';
import { SortingField, SortingStrategy } from '~/app.enums.js';
import { SymbolicIcons } from '~/static/tasks.js';

/**
 * Predefined options for sorting fields available in the UI.
 */
export const SortingFieldOptions: ISortingFieldOption[] = [
  {
    label: AppLocale.sorting.fields[SortingField.byDate],
    icon: SymbolicIcons.none,
    mode: SortingField.byDate,
  },
  {
    label: AppLocale.sorting.fields[SortingField.byProject],
    icon: SymbolicIcons.none,
    mode: SortingField.byProject,
  },
  {
    label: AppLocale.sorting.fields[SortingField.byStatus],
    icon: SymbolicIcons.none,
    mode: SortingField.byStatus,
  },
  {
    label: AppLocale.sorting.fields[SortingField.byTitle],
    icon: SymbolicIcons.none,
    mode: SortingField.byTitle,
  },
];

/**
 * Predefined options for sorting strategies available in the UI.
 */
export const SortingModeOptions: ISortingStrategyOption[] = [
  {
    icon: SymbolicIcons.sorting.sort_ascending,
    strategy: SortingStrategy.ascending,
  },
  {
    icon: SymbolicIcons.sorting.sort_descending,
    strategy: SortingStrategy.descending,
  },
];
