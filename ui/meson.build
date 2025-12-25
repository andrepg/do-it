pkgdatadir = get_option('datadir') / meson.project_name()
gnome = import('gnome')

data_res = gnome.compile_resources(
  application_name + '.data',
  application_name + '.data.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)