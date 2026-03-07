scalable_dir = 'hicolor' / 'scalable' / 'apps'
symbolic_dir = 'hicolor' / 'symbolic' / 'apps'

## Install main application icon
install_data(
  scalable_dir / app_id + '.svg',
  rename: app_id + '.svg',
  install_dir: get_option('datadir') / 'icons' / scalable_dir
)

## Install symbolic icon
install_data(
  symbolic_dir / app_id + '-symbolic.svg',
  rename: app_id + '-symbolic.svg',
  install_dir: get_option('datadir') / 'icons' / symbolic_dir
)