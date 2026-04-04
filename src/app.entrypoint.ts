/* app.entrypoint.ts
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
imports.gi.versions.Gtk = '4.0';
imports.gi.versions.Gdk = '4.0';
imports.gi.versions.Adw = '1';

import { DoitApplication } from './app.wrapper.js';

pkg.initGettext();
pkg.initFormat();

/**
 * Application entry point. Initializes global configurations and runs the application.
 *
 * @param argv Command line arguments.
 * @returns The exit code of the application.
 */
export async function main(argv: string[]): Promise<number> {
  return await new DoitApplication().runAsync(argv);
}
