/* log-manager.ts
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
import { is_development_mode } from './application.js';

/**
 * Logs a message to the console exclusively in development mode.
 *
 * @param component The name of the component or module originating the log.
 * @param message The message to be logged.
 */
export const log = (component: string, message: string) =>
  is_development_mode() ? console.log(`[${component}] ${message}`) : null;

/**
 * Logs a warning message to the console.
 *
 * @param component The name of the component or module originating the warning.
 * @param message The warning message to be logged.
 */
export const warn = (component: string, message: string) =>
  console.warn(`[${component}] ${message}`);

/**
 * Logs an error message to the console.
 *
 * @param component The name of the component or module originating the error.
 * @param message The error message to be logged.
 */
export const error = (component: string, message: string) =>
  console.error(`[${component}] ${message}`);
