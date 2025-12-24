## Build application
cd $(pwd)

flatpak run \
    org.flatpak.Builder $(pwd)/_build \
    --force-clean --verbose --user --install \
    $(pwd)/io.github.andrepg.Doit.devel.json
