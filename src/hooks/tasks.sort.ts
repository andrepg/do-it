/* tasks.sort.ts
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
import { SortingField, SortingModeSchema, SortingStrategy } from '~/app.enums.js';
import { useSettings } from '~/hooks/settings.js';
import {
  create_comparator,
  sort_by_date,
  sort_by_project,
  sort_by_project_name,
  sort_by_status,
  sort_by_title,
} from '~/core/utils/sort.js';

/**
 * Dictionary that maps sorting fields to their corresponding sorting functions.
 */
const SORT_DICT: Record<
  SortingField,
  (strategy: SortingStrategy) => ReturnType<typeof create_comparator>
> = {
  [SortingField.byDate]: sort_by_date,
  [SortingField.byStatus]: sort_by_status,
  [SortingField.byTitle]: sort_by_title,
  [SortingField.byProject]: sort_by_project,
};

/**
 * React-like hook that provides task sorting capabilities and state management.
 *
 * Exposes methods to sort tasks by date, status, title, or project, and to persist
 * and retrieve sorting preferences from system settings.
 */
export const useTaskSort = () => {
  const settings = useSettings();

  const retrieve_sort_preferences = () => {
    const mode = settings.get_string(SortingModeSchema.MODE) as SortingField;
    const strategy = settings.get_string(SortingModeSchema.STRATEGY) as SortingStrategy;

    return {
      mode: mode || SortingField.byTitle,
      strategy: strategy || SortingStrategy.ascending,
    };
  };

  const sort_by = (field: SortingField, strategy: SortingStrategy) => {
    return SORT_DICT[field](strategy);
  };

  const persist_sort_preferences = (mode: SortingField, strategy: SortingStrategy) => {
    settings.set_string(SortingModeSchema.MODE, mode);
    settings.set_string(SortingModeSchema.STRATEGY, strategy);
  };

  return {
    sort_by,
    sort_by_date,
    sort_by_status,
    sort_by_title,
    sort_by_project,
    sort_by_project_name,

    persist_sort_preferences,
    retrieve_sort_preferences,
  };
};
