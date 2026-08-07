/* sort.ts
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
import type { ITaskView } from '~/core/interfaces/task-view.js';
import { SortingStrategy } from '~/app.enums.js';

type ExtractorFunction = (item: ITaskView) => unknown;

export const create_comparator = (extractors: ExtractorFunction[], strategy: SortingStrategy) => {
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

export const sort_by_date = (strategy: SortingStrategy) => {
  return create_comparator([(item: ITaskView) => new Date(item.created).getTime()], strategy);
};

export const sort_by_status = (strategy: SortingStrategy) => {
  return create_comparator([(item: ITaskView) => (item.done ? 1 : 0)], strategy);
};

export const sort_by_title = (strategy: SortingStrategy) => {
  return create_comparator([(item: ITaskView) => item.title], strategy);
};

export const sort_by_project_name = (strategy: SortingStrategy) => {
  return (a: string, b: string) => {
    if (a === '') return -1;
    if (b === '') return 1;

    const isAscending = strategy === SortingStrategy.ascending;
    const comparison = a.localeCompare(b);

    return isAscending ? comparison : -comparison;
  };
};

export const sort_by_project = (strategy: SortingStrategy) => {
  return (a: ITaskView, b: ITaskView) => {
    const project_a = a.project || '';
    const project_b = b.project || '';
    return sort_by_project_name(strategy)(project_a, project_b);
  };
};
