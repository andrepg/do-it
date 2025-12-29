scalable_dir = 'hicolor' / 'scalable' / 'apps'
symbolic_dir = 'hicolor' / 'symbolic' / 'apps'

# TODO : Replace `application_name` with the plus suffix when development
install_data(
  scalable_dir / ('@0@.svg').format(application_name + application_suffix),
  install_dir: get_option('datadir') / 'icons' / scalable_dir
)

# TODO : Replace `application_name` with the plus suffix when development
install_data(
  symbolic_dir / ('@0@-symbolic.svg').format(application_name),
  install_dir: get_option('datadir') / 'icons' / symbolic_dir
)
