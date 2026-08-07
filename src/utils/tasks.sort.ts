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
import { SortingModeSchema } from '~/app.enums.js';
import { SortingField, SortingStrategy } from "~/static/sorting.js";
import { get_settings } from '~/utils/settings.js';
import {
  create_comparator,
  sort_by_date,
  sort_by_project,
  sort_by_status,
  sort_by_title,
} from '~/utils/sort.js';

/**
 * Dictionary that maps sorting fields to their corresponding sorting functions.
 */
const SortingStrategiesDict: Record<
  SortingField,
  (strategy: SortingStrategy) => ReturnType<typeof create_comparator>
> = {
  [SortingField.byDate]: sort_by_date,
  [SortingField.byStatus]: sort_by_status,
  [SortingField.byTitle]: sort_by_title,
  [SortingField.byProject]: sort_by_project,
};

/**
 * Retrieves the persisted sorting preferences from system settings.
 */
export const retrieve_sort_preferences = () => {
  const settings = get_settings();
  const mode = settings.get_string(SortingModeSchema.MODE) as SortingField;
  const strategy = settings.get_string(SortingModeSchema.STRATEGY) as SortingStrategy;

  return {
    mode: mode || SortingField.byTitle,
    strategy: strategy || SortingStrategy.ascending,
  };
};

/**
 * Builds a comparator function for the given sorting field and strategy.
 */
export const sort_by = (sortingField: SortingField, sortingStrategy: SortingStrategy) => {
  const sortFunction = SortingStrategiesDict[sortingField];

  return sortFunction(sortingStrategy);
};

/**
 * Persists the given sorting preferences to system settings.
 */
export const persist_sort_preferences = (
  sortingField: SortingField,
  sortingStrategy: SortingStrategy,
) => {
  const settings = get_settings();
  settings.set_string(SortingModeSchema.MODE, sortingField);
  settings.set_string(SortingModeSchema.STRATEGY, sortingStrategy);
};
