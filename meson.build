project(
    'io.github.andrepg.Doit',
    version: '2.0.1',
    meson_version: '>= 1.4.0',
    default_options: [
        'warning_level=2',
        'c_std=c11',
        'cpp_std=c++17',
        'b_ndebug=false',
        'b_sanitize=address',
        'b_lto=true',
        'b_pie=true',
        'b_staticpic=true',
        'buildtype=debugoptimized',
    ],
)

i18n = import('i18n')
gnome = import('gnome')

app_is_dev = get_option('development')

app_codename = 'Do It'
app_id = meson.project_name()
app_name = meson.project_name()
app_version = meson.project_version()
app_res_path = '/io/github/andrepg/Doit'

app_datadir = get_option('prefix') / get_option('datadir')

if app_is_dev
    app_id += '.Devel'
    app_res_path += '/Devel'
    app_codename += ' (Devel)'
endif

app_config = configuration_data()
app_config.set('GJS', find_program('gjs').full_path())
app_config.set('PACKAGE_NAME', app_name)
app_config.set('PACKAGE_VERSION', app_version)
app_config.set('APPLICATION_ID', app_id)
app_config.set('APPLICATION_RES', app_res_path)
app_config.set('APPLICATION_NAME', app_codename)
app_config.set('is_devel', app_is_dev ? 'true' : 'false')
app_config.set('prefix', get_option('prefix'))
app_config.set('bindir', get_option('prefix') / get_option('bindir'))
app_config.set('datadir', app_datadir)
app_config.set('libdir', get_option('prefix') / get_option('libdir'))

message('## Application ID: ' + app_id)
message('## Application Resource Path: ' + app_res_path)
message('## Application Data Dir: ' + app_datadir)

# ## Process Source Code and Javascript buildable
subdir('data')
subdir('ui')
subdir('src')
subdir('po')

gnome.post_install(
  glib_compile_schemas: true, 
  gtk_update_icon_cache: true,
  update_desktop_database: true,
)