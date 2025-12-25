## Declare programs used beyond import
appstreamcli = find_program('appstreamcli', required: true, disabler: true)
compile_schemas = find_program('glib-compile-schemas', required: true, disabler: true)
desktop_utils = find_program('desktop-file-validate', required: true, disabler: true)
configuration_data = configuration_data()

# Some variables used to compile and install files
desktop_file_name = application_name + '.desktop'
service_file_name = application_name + '.service'
metainfo_file_name = application_name + '.metainfo.xml'
gschema_file_name = application_name + '.gschema.xml'

desktop_file = i18n.merge_file(
        input: desktop_file_name + '.in',
       output: desktop_file_name,
         type: 'desktop',
       po_dir: meson.project_source_root() / 'po',
      install: true,
  install_dir: application_datadir / 'applications'
)

appstream_file = i18n.merge_file(
        input: metainfo_file_name + '.in',
       output: metainfo_file_name,
       po_dir: meson.project_source_root() / 'po',
      install: true,
  install_dir: application_datadir / 'metainfo'
)

# Install data schema
install_data(gschema_file_name, install_dir: application_datadir / 'glib-2.0' / 'schemas')

## Test mandatory schemas to publish on Flatpak/Flathub
test('Validate desktop file', desktop_utils, args: [desktop_file])
test('Validate appstream file', appstreamcli, args: ['validate', '--no-net', '--explain', appstream_file])
test('Validate schema file', compile_schemas, args: ['--strict', '--dry-run', meson.current_source_dir()])

## Configure app services using service file
configuration_data.set('bindir', get_option('prefix') / get_option('bindir'))
configure_file(
  input: service_file_name + '.in',
  output: service_file_name,
  configuration: configuration_data,
  install_dir: application_datadir / 'dbus-1' / 'services'
)

# Call meson.build on icons subdirectory
subdir('icons')
