import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

const APPLICATION_ID = 'io.github.andrepg.Doit'

const APPLICATION_RES = '/io/github/andrepg/Doit'

function get_application_id() {
  const prefix = APPLICATION_ID;
  const suffix = is_development_mode() ? '.Devel' : '';

  return prefix.concat(suffix)
}

function get_resource_path() {
  const prefix = APPLICATION_RES;
  const suffix = is_development_mode() ? '.Devel' : '';

  return prefix.concat(suffix)
}

function is_development_mode() {
  return GLib.getenv('DEVELOPMENT')
}

function get_settings_container() {
  return new Gio.Settings({ schema_id: APPLICATION_ID });
}

function get_setting_int(name) {
  const _container = get_settings_container();

  return _container.get_int(name)
}

function set_setting_int(name, value) {
  const _container = get_settings_container();

  _container.set_int(name, value)
}

function get_setting_string(name) {
  const _container = get_settings_container();

  return _container.get_string(name)
}

function set_setting_string(name, value) {
  const _container = get_settings_container();

  _container.set_string(name, value)
}

export {
  get_resource_path,
  get_application_id,
  is_development_mode,

  set_setting_int,
  get_setting_int,

  get_setting_string,
  set_setting_string,
}
