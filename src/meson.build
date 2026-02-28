gnome = import('gnome')

# Find TypeScript compiler
tsc = find_program('tsc', required: true)

# We use a stamp file and a shell script to run the compiler without
# needing to list each .ts file individually in Meson.
# This ensures flexibility: you can add/remove .ts files at will.
tsc_target = custom_target(
  'tsc-compile',
  command: [
    'sh', '-c', 
    'tsc --outDir "$1" --project "$2" && touch "$3"', 
    '_',
    meson.current_build_dir(),
    meson.project_source_root() / 'tsconfig.json',
    '@OUTPUT@'
  ],
  output: 'tsc.stamp',
  build_by_default: true,
  build_always_stale: true, # TSC handles incremental caching, we force Meson to always call it
)

pkgdatadir = get_option('datadir') / meson.project_name()

configure_file(
  input: 'utils/application.js.in',
  output: 'application.js',
  configuration: application_configuration
)

src_res = gnome.compile_resources(application_name + '.src',
  configure_file(
    input: application_name + '.src.gresource.xml.in',
    output: application_name + '.src.gresource.xml',
    configuration: application_configuration
  ),
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
  source_dir: [meson.current_source_dir(), meson.current_build_dir(), meson.current_build_dir() / 'src'],
  dependencies: [tsc_target]
)

configure_file(
  input: application_name +'.in',
  output: application_id,
  configuration: application_configuration,
  install: true,
  install_dir: get_option('bindir')
)