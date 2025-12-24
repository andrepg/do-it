#
#
# Meson build file for Doit application 
# Copyright 2025 - André Paul Grandsire
#
#
project('io.github.andrepg.Doit',
          version: '0.1.4',
    meson_version: '>= 1.0.0',
  default_options: [ 'warning_level=2', 'werror=false', ],
)

## Import everything we need to build
i18n = import('i18n')
gnome = import('gnome')

## Then we set any global variables
application_id = meson.project_name()
application_version = meson.project_version()
application_suffix = get_option('development') == true ? '.Devel' : ''
application_datadir = get_option('datadir')

application_resource_path = '/io/github/andrepg/Doit'

# ## Process Source Code and Javascript buildable
subdir('data')
subdir('ui')
subdir('src')
subdir('po')

gnome.post_install(
  glib_compile_schemas: true, 
  gtk_update_icon_cache: true,
  update_desktop_database: true,
)
