i18n.gettext(
  app_id,
  preset: 'glib',
  args: [
    '--keyword=C_:1c,2',
    '--flag=C_:2:pass-c-format',
    '--directory=' + meson.project_source_root() / 'po',
  ],
  install_dir: 'share/locale'
)

add_global_arguments('-DGETTEXT_PACKAGE="@0@"'.format (app_id), language:'c')
add_global_arguments('-DGETTEXT_DOMAIN="@0@"'.format (app_id), language:'c')
