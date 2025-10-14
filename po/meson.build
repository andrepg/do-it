add_global_arguments('-DGETTEXT_PACKAGE="@0@"'.format (application_id), language:'c')
add_global_arguments('-DGETTEXT_DOMAIN="@0@"'.format (application_id), language:'c')

i18n.gettext(
  application_id,
  args: '--directory=' + meson.project_source_root() / 'po',
  preset: 'glib'
)
