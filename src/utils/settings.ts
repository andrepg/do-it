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