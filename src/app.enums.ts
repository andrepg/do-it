/* app.enums.ts
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
 * Defines the available fields by which tasks can be sorted.
 */
export enum SortingField {
    byDate = 'by_date',

    byStatus = 'by_status',

    byTitle = 'by_title',

    byProject = 'by_project'
}

/**
 * Defines the direction of the sorting strategy.
 */
export enum SortingStrategy {
    ascending = 0,
    descending = 1,
}

/**
 * GSettings keys for sorting mode preferences.
 */
export const SortingModeSchema = {
    MODE: 'sorting-mode',
    STRATEGY: 'sorting-strategy',
}

/**
 * GSettings keys for main window application settings.
 */
export const DoItSettings = {
    windowHeight: 'window-height',
    windowWidth: 'window-width',
}