## Build application
flatpak run \
    org.flatpak.Builder $(pwd)/_build \
    --force-clean --verbose \
    $(pwd)/io.github.andrepg.Doit.json
