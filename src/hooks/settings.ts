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
import Gio20 from 'gi://Gio';

import { APPLICATION_ID } from '../utils/application.js';

export const useSettings = () => {
  const settings: Gio20.Settings = new Gio20.Settings({ schemaId: APPLICATION_ID });

  const get_int = (key: string) => settings.get_int(key);

  const set_int = (key: string, value: number) => settings.set_int(key, value);

  const get_string = (key: string) => settings.get_string(key);

  const set_string = (key: string, value: string) => settings.set_string(key, value);

  return {
    get_int,
    set_int,
    get_string,
    set_string,
  };
};
