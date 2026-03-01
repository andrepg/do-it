import Gio from 'gi://Gio';

const APPLICATION_ID = '@APPLICATION_ID@'
const APPLICATION_RES = '@resource_path@'

function get_application_id() {
  return APPLICATION_ID
}

function get_resource_path() {
  return APPLICATION_RES
}

function is_development_mode() {
  return '@is_devel@' === 'true'
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
