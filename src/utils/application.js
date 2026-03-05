import Gio from 'gi://Gio';

const APPLICATION_ID = '@APPLICATION_ID@'
const APPLICATION_RES = '@resource_path@'

function get_application_id() {
  return imports.package.name;
}

function get_resource_path() {
  return imports.package.name;
}

function is_development_mode() {
  return '@is_devel@' === 'true'
}

export {
  get_resource_path,
  get_application_id,
  is_development_mode,
}
