## Programs used in this script
appstreamcli = find_program('appstreamcli', required: true, disabler: true)
compile_schemas = find_program('glib-compile-schemas', required: true, disabler: true)
desktop_utils = find_program('desktop-file-validate', required: true, disabler: true)

##
## Desktop file generation
##
desktop_input_file = app_name + '.desktop.in'
desktop_output_file = app_id + '.desktop'

message('## Configuring desktop file ' + desktop_output_file)
i18n.merge_file(
    input: desktop_input_file,
    output: desktop_input_file,
    po_dir: meson.project_source_root() / 'po',
)

configure_file(
    input: desktop_input_file,
    output: desktop_output_file,
    configuration: app_config,
    install: true,
    install_dir: get_option('prefix') / get_option('datadir') / 'applications'
)

##
## GSchema file generation
##
gschema_input_file = app_name + '.gschema.xml.in'
gschema_output_file = app_id + '.gschema.xml'
message('## Configuring gschema file ' + gschema_output_file)

configure_file(
    input: gschema_input_file,
    output: gschema_output_file,
    configuration: app_config,
    install: true,
    install_dir: app_datadir / 'glib-2.0' / 'schemas'
)

##
## Generate Flatpak AppStream files
##
appstream_input_file = app_name + '.metainfo.xml.in'
appstream_output_file = app_id + '.metainfo.xml'
message('## Configuring flatpak metainfo file ' + appstream_output_file)

appstream_file = i18n.merge_file(
    input: configure_file(
        input: appstream_input_file,
        output: appstream_input_file,
        configuration: app_config
    ),
    output: appstream_output_file,
    po_dir: meson.project_source_root() / 'po',
    install: true,
    install_dir: app_datadir / 'metainfo'
)

 ## Configure app services using service file
configure_file(
  input: app_name + '.service.in',
  output: app_id + '.service',
  configuration: app_config,
  install_dir: app_datadir / 'dbus-1' / 'services'
)

##
## Validate generated files
##
test('validate-desktop-file', 
    desktop_utils,
    args: [desktop_output_file])

test('validate-appstream-file',
    appstreamcli,
    args: ['validate', '--no-net', '--explain', appstream_file])

test('validate-schemas-files', 
    compile_schemas, 
    args: ['--strict', '--dry-run', meson.current_build_dir()])

## Call subdir meson.build
subdir('icons')
