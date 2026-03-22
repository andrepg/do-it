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
import Gio from "gi://Gio";

import { APPLICATION_ID } from "./application.js";

let settings: Gio.Settings | null = null;

function get_settings_container(): Gio.Settings {
    if (!settings) {
        settings = new Gio.Settings({ schema_id: APPLICATION_ID });
    }

    return settings;
}

/**
 * Retrieves an integer value from application settings.
 */
export function get_setting_int(name: string) {
    return get_settings_container().get_int(name)
}

/**
 * Sets an integer value in the application settings.
 */
export function set_setting_int(name: string, value: number) {
    get_settings_container().set_int(name, value)
}

/**
 * Retrieves a string value from application settings.
 */
export function get_setting_string(name: string) {
    return get_settings_container().get_string(name)
}

/**
 * Sets a string value in the application settings.
 */
export function set_setting_string(name: string, value: string) {
    get_settings_container().set_string(name, value)
}