import Gio from "gi://Gio";


export function get_settings_container() {
    return new Gio.Settings({
        schema_id: imports.package.name.concat('.Devel')
    });
}

export function get_setting_int(name: string) {
    const _container = get_settings_container();

    return _container.get_int(name)
}

export function set_setting_int(name: string, value: number) {
    const _container = get_settings_container();

    _container.set_int(name, value)
}

export function get_setting_string(name: string) {
    const _container = get_settings_container();

    return _container.get_string(name)
}

export function set_setting_string(name: string, value: string) {
    const _container = get_settings_container();

    _container.set_string(name, value)
}