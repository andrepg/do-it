gnome = import('gnome')

application_configuration = configuration_data()

application_configuration.set('APPLICATION_ID', application_id)
application_configuration.set('PACKAGE_VERSION', meson.project_version())
application_configuration.set('PACKAGE_NAME', meson.project_name())
application_configuration.set('GJS', find_program('gjs').full_path())

application_configuration.set('prefix', get_option('prefix'))
application_configuration.set('libdir', get_option('prefix') / get_option('libdir'))
application_configuration.set('datadir', get_option('prefix') / get_option('datadir'))
application_configuration.set('resource_path', '/io/github/andrepg/Doit')
# configuration_data.set('GJS', find_program('gjs').full_path())

# configuration_data.set('PACKAGE_NAME', meson.project_name())

# configuration_data.set('APPLICATION_ID', application_id)
# configuration_data.set('PACKAGE_VERSION', application_version)
# configuration_data.set('APPLICATION_RES', application_resource_path)

# configuration_data.set('prefix', get_option('prefix'))
# configuration_data.set('libdir', get_option('prefix') / get_option('libdir'))
# configuration_data.set('datadir', get_option('prefix') / application_datadir)
# configuration_data.set('resource_path', application_resource_path)

pkgdatadir = get_option('datadir') / meson.project_name()
gnome = import('gnome')

src_res = gnome.compile_resources(application_id + '.src',
  application_id + '.src.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

configure_file(
  input: application_name +'.in',
  output: application_name,
  configuration: application_configuration,
  install: true,
  install_dir: get_option('bindir')
)