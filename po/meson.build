i18n.gettext(
  meson.project_name(),
  args: '--directory=' + meson.project_source_root() / 'po',
  preset: 'glib'
)

add_global_arguments('-DGETTEXT_PACKAGE="@0@"'.format (meson.project_name()), language:'c')
add_global_arguments('-DGETTEXT_DOMAIN="@0@"'.format (meson.project_name()), language:'c')
