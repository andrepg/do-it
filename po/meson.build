i18n.gettext(
  application_name,
  args: '--directory=' + meson.project_source_root() / 'po',
  preset: 'glib'
)

add_global_arguments('-DGETTEXT_PACKAGE="@0@"'.format (application_name), language:'c')
add_global_arguments('-DGETTEXT_DOMAIN="@0@"'.format (application_name), language:'c')
