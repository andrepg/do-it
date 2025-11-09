project('io.github.andrepg.Doit',
          version: '0.1.1',
    meson_version: '>= 1.0.0',
  default_options: [ 'warning_level=2', 'werror=false', ],
)

application_id = meson.project_name()

i18n = import('i18n')
gnome = import('gnome')

subdir('data')
subdir('src')
subdir('po')

gnome.post_install(
     glib_compile_schemas: true,
    gtk_update_icon_cache: true,
  update_desktop_database: true,
)
