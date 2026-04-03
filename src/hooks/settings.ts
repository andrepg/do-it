/* settings.ts
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
import Gio from 'gi://Gio';

import { APPLICATION_ID } from '~/utils/application.js';

let settingsInstance: Gio.Settings | null = null;

export const useSettings = () => {
  if (!settingsInstance) {
    settingsInstance = new Gio.Settings({ schemaId: APPLICATION_ID });
  }

  const get_int = (key: string) => settingsInstance!.get_int(key);

  const set_int = (key: string, value: number) => settingsInstance!.set_int(key, value);

  const get_string = (key: string) => settingsInstance!.get_string(key);

  const set_string = (key: string, value: string) => settingsInstance!.set_string(key, value);

  const get_enum = (key: string) => settingsInstance!.get_enum(key);

  const set_enum = (key: string, value: number) => settingsInstance!.set_enum(key, value);

  return {
    get_int,
    set_int,
    get_string,
    set_string,
    get_enum,
    set_enum,
  };
};
