app_conf = configuration_data()

app_conf.set('APPLICATION_ID', application_id)
app_conf.set('PACKAGE_VERSION', meson.project_version() + version_suffix)
app_conf.set('PACKAGE_NAME', meson.project_name())
app_conf.set('GJS', find_program('gjs').full_path())

app_conf.set('profile', profile)
app_conf.set('prefix', get_option('prefix'))
app_conf.set('libdir', get_option('prefix') / get_option('libdir'))
app_conf.set('datadir', get_option('prefix') / get_option('datadir'))
app_conf.set('resource_path', '/io/github/andrepg/Doit')

pkgdatadir = get_option('datadir') / meson.project_name()
gnome = import('gnome')

src_res = gnome.compile_resources(application_id + '.src',
  application_id + '.src.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

data_res = gnome.compile_resources(application_id + '.data',
  application_id + '.data.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

configure_file(
  input: application_id +'.in',
  output: application_id,
  configuration: app_conf,
  install: true,
  install_dir: get_option('bindir')
)
