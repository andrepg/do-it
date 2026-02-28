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

## Define Profile and Application ID
profile = get_option('development') ? 'devel' : 'default'
application_id = 'io.github.andrepg.Doit'

if profile == 'devel'
  application_id += '.Devel'
endif

## Then we set any global variables
application_name = meson.project_name()
application_version = meson.project_version()
application_datadir = get_option('datadir')

application_resource_path = '/io/github/andrepg/Doit'
if profile == 'devel'
  application_resource_path += '/Devel'
endif

# Central configuration data
application_configuration = configuration_data()
application_configuration.set('APPLICATION_ID', application_id)
application_configuration.set('PACKAGE_VERSION', application_version)
application_configuration.set('PACKAGE_NAME', application_name)
application_configuration.set('resource_path', application_resource_path)
application_configuration.set('is_devel', get_option('development') ? 'true' : 'false')
application_configuration.set('prefix', get_option('prefix'))
application_configuration.set('bindir', get_option('prefix') / get_option('bindir'))
application_configuration.set('datadir', get_option('prefix') / get_option('datadir'))
application_configuration.set('libdir', get_option('prefix') / get_option('libdir'))
application_configuration.set('GJS', find_program('gjs').full_path())
application_configuration.set('GTK', '4.21')

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
