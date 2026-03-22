import Gio from "gi://Gio";

import { APPLICATION_ID } from "./application.js";

let settings: Gio.Settings | null = null;

function get_settings_container(): Gio.Settings {
    if (!settings) {
        settings = new Gio.Settings({ schema_id: APPLICATION_ID });
    }

    return settings;
}

export function get_setting_int(name: string) {
    return get_settings_container().get_int(name)
}

export function set_setting_int(name: string, value: number) {
    get_settings_container().set_int(name, value)
}

export function get_setting_string(name: string) {
    return get_settings_container().get_string(name)
}

export function set_setting_string(name: string, value: string) {
    get_settings_container().set_string(name, value)
}