##
## General imports to our project
##
gnome = import('gnome')

##
## TSC and Typescript compilation
##
## This is the first thing to do, as we need to convert from TS
## to JS before anything GNOME related. We also use a stamp file
## in order to load all TS files from src/ folder.
##
find_program('tsc', required: true)
tsc_target = custom_target(
    'tsc-compile',
    output: 'tsc.stamp',
    build_by_default: true,
    build_always_stale: true, # Ignores TSC incremental caching and rebuild
    command: [
        'sh', '-c',
        'tsc --outDir "$1" --rootDir "$2" --project "$3" && touch "$4"',
        '_',
        meson.current_build_dir(),
        meson.current_source_dir(),
        meson.project_source_root() / 'tsconfig.json',
        '@OUTPUT@'
    ]
)

##
## Configure and replace application.js strings
## TODO - This should be removed in the future
##
configure_file(
    input: 'utils/application.js',
    output: 'application.js',
    configuration: app_config
)

##
## Configure and generate binary entrypoint
##
configure_file(
    input: app_name + '.in',
    output: app_id,
    configuration: app_config,
    install: true,
    install_dir: get_option('bindir')
)

##
## Configure and compile GNOME resources
##
res_file = configure_file(
    input: app_name + '.src.gresource.xml.in',
    output: app_id + '.src.gresource.xml',
    configuration: app_config
)

gnome.compile_resources(
    app_id + '.src', # Changed to match package.js expectation
    res_file,
    gresource_bundle: true,
    install: true,
    install_dir: get_option('datadir') / app_id,
    dependencies: [tsc_target],
    source_dir: [
        meson.current_source_dir(),
        meson.current_build_dir()
    ]
)