scalable_dir = 'hicolor/scalable/apps'
symbolic_dir = 'hicolor/symbolic/apps'

# Identify the source icon name: prefer .Devel in devel profile if it exists
icon_name = application_name
if profile == 'devel'
  icon_name = application_id
endif

# Use application_id for icon installation
install_data(
  scalable_dir / icon_name + '.svg',
  rename: application_id + '.svg',
  install_dir: get_option('datadir') / 'icons' / scalable_dir
)

install_data(
  symbolic_dir / application_name + '-symbolic.svg',
  rename: application_id + '-symbolic.svg',
  install_dir: get_option('datadir') / 'icons' / symbolic_dir
)
