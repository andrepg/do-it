/* app.types.ts
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

/**
 * Represents a single task entity in the application.
 */
export interface ITask {
  id?: number;
  title: string;
  created_at: number;
  project?: string;
  completed_at?: Date | null;
  tags?: string[];
  deleted?: boolean;
  done?: boolean;
}

/**
 * Configuration option for a sorting field in the UI.
 */
export interface ISortingFieldOption {
  label: string;
  icon?: string;
  mode: SortingField;
}

/**
 * Configuration option for a sorting strategy in the UI.
 */
export interface ISortingStrategyOption {
  icon: string;
  strategy: SortingStrategy;
}
