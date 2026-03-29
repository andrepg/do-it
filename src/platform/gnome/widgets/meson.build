gnome.compile_resources(
  app_id + '.data',
  configure_file(
    input: app_name + '.data.gresource.xml.in',
    output: app_id + '.data.gresource.xml',
    configuration: app_config
  ),
  gresource_bundle: true,
  install: true,
  install_dir: get_option('datadir') / app_id,
)