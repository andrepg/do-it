i18n.gettext(
  app_id,
  args: '--directory=' + meson.project_source_root() / 'po',
  preset: 'glib',
  install_dir: 'share/locale'
)

add_global_arguments('-DGETTEXT_PACKAGE="@0@"'.format (app_id), language:'c')
add_global_arguments('-DGETTEXT_DOMAIN="@0@"'.format (app_id), language:'c')
