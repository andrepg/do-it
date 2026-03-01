pkgdatadir = get_option('datadir') / application_name

data_res = gnome.compile_resources(
  application_name + '.data',
  configure_file(
    input: application_name + '.data.gresource.xml.in',
    output: application_name + '.data.gresource.xml',
    configuration: application_configuration
  ),
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)