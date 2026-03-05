## Declare programs used beyond import
appstreamcli = find_program('appstreamcli', required: true, disabler: true)
compile_schemas = find_program('glib-compile-schemas', required: true, disabler: true)
desktop_utils = find_program('desktop-file-validate', required: true, disabler: true)
configuration_data = configuration_data()

# Some variables used to compile and install files
desktop_file_name = application_id + '.desktop'
service_file_name = application_id + '.service'
metainfo_file_name = application_id + '.metainfo.xml'

desktop_file = i18n.merge_file(
        input: configure_file(
          input: application_name + '.desktop.in',
          output: application_id + '.desktop.in',
          configuration: application_configuration
        ),
       output: desktop_file_name,
          type: 'desktop',
        po_dir: meson.project_source_root() / 'po',
       install: true,
   install_dir: application_datadir / 'applications'
)

appstream_file = i18n.merge_file(
        input: configure_file(
          input: application_name + '.metainfo.xml.in',
          output: application_id + '.metainfo.xml.in',
          configuration: application_configuration
        ),
       output: metainfo_file_name,
       po_dir: meson.project_source_root() / 'po',
      install: true,
  install_dir: application_datadir / 'metainfo'
)

# Install data schema
configure_file(
  input: application_name + '.gschema.xml.in',
  output: application_id + '.gschema.xml.in',
  configuration: application_configuration,
  install: true,
  install_dir: application_datadir / 'glib-2.0' / 'schemas'
)

## Test mandatory schemas to publish on Flatpak/Flathub
test('Validate desktop file', desktop_utils, args: [desktop_file])
test('Validate appstream file', appstreamcli, args: ['validate', '--no-net', '--explain', appstream_file])
test('Validate schema file', compile_schemas, args: ['--strict', '--dry-run', meson.current_build_dir()])

## Configure app services using service file
configure_file(
  input: application_name + '.service.in',
  output: service_file_name,
  configuration: application_configuration,
  install_dir: application_datadir / 'dbus-1' / 'services'
)

# Call meson.build on icons subdirectory
subdir('icons')
