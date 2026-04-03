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
import type { ITaskView } from '~/core/interfaces/task-view.js';
import { useSettings } from './settings.js';

type ExtractorFunction = (item: ITaskView) => unknown;

/**
 * React-like hook that provides task sorting capabilities and state management.
 *
 * Exposes methods to sort tasks by date, status, title, or project, and to persist
 * and retrieve sorting preferences from system settings.
 */
export const useTaskSort = () => {
  let current_sort_mode: SortingField = SortingField.byTitle;

  let current_sort_strategy: SortingStrategy = SortingStrategy.ascending;

  const settings = useSettings();

  const create_comparator = (extractors: ExtractorFunction[], strategy: SortingStrategy) => {
    const isAscending = strategy === SortingStrategy.ascending;

    const compare_numeric = (a: number, b: number) => a - b;
    const compare_string = (a: string, b: string) => a.localeCompare(b);

    return (a: ITaskView, b: ITaskView) => {
      for (const extractor of extractors) {
        const value_of_a = extractor(a);
        const value_of_b = extractor(b);

        if (value_of_a === value_of_b) continue;

        const direction = isAscending ? 1 : -1;

        const ordering =
          typeof value_of_a === 'string' && typeof value_of_b === 'string'
            ? compare_string(value_of_a, value_of_b)
            : compare_numeric(value_of_a as number, value_of_b as number);

        return ordering * direction;
      }

      return 0;
    };
  };

  const sort_by_date = (strategy: SortingStrategy) => {
    return create_comparator([(item: ITaskView) => new Date(item.created).getTime()], strategy);
  };

  const sort_by_status = (strategy: SortingStrategy) => {
    return create_comparator([(item: ITaskView) => (item.done ? 1 : 0)], strategy);
  };

  const sort_by_title = (strategy: SortingStrategy) => {
    return create_comparator([(item: ITaskView) => item.title], strategy);
  };

  const sort_by_project_name = (strategy: SortingStrategy) => {
    return (a: string, b: string) => {
      if (a === '') return -1;
      if (b === '') return 1;
      // Empty project names always sort to the beginning (intentional)

      const isAscending = strategy === SortingStrategy.ascending;
      const comparison = a.localeCompare(b);

      return isAscending ? comparison : -comparison;
    };
  };

  const sort_by_project = (strategy: SortingStrategy) => {
    return (a: ITaskView, b: ITaskView) => {
      const project_a = a.project || '';
      const project_b = b.project || '';
      return sort_by_project_name(strategy)(project_a, project_b);
    };
  };

  const sort_by = (field: SortingField, strategy: SortingStrategy) => {
    current_sort_mode = field;
    current_sort_strategy = strategy;

    switch (field) {
      case SortingField.byDate:
        return sort_by_date(strategy);
      case SortingField.byStatus:
        return sort_by_status(strategy);
      case SortingField.byTitle:
        return sort_by_title(strategy);
      case SortingField.byProject:
        return sort_by_project(strategy);
      default:
        return sort_by_date(strategy);
    }
  };

  const persist_sort_preferences = () => {
    settings.set_string(SortingModeSchema.MODE, current_sort_mode);
    settings.set_string(SortingModeSchema.STRATEGY, current_sort_strategy);
  };

  const retrieve_sort_preferences = () => {
    current_sort_mode = settings.get_string(SortingModeSchema.MODE) as SortingField;
    current_sort_strategy = settings.get_string(SortingModeSchema.STRATEGY) as SortingStrategy;

    return {
      mode: current_sort_mode,
      strategy: current_sort_strategy,
    };
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
