const APPLICATION_ID = '@APPLICATION_ID@';
const APPLICATION_NAME = '@APPLICATION_NAME@';
const APPLICATION_RES = '@APPLICATION_RES@';
const IS_DEVEL = '@is_devel@' === 'true';

function get_application_id() {
  return APPLICATION_ID;
}

function get_resource_path() {
  return APPLICATION_RES;
}

function get_template_path(path) {
  return `resource://${APPLICATION_RES}/${path}`;
}

function is_development_mode() {
  return IS_DEVEL;
}

export {
  APPLICATION_ID,
  APPLICATION_RES,
  APPLICATION_NAME,
  IS_DEVEL,
  get_resource_path,
  get_application_id,
  get_template_path,
  is_development_mode,
};
