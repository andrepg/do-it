## Build application
cd $(pwd)

sh scripts/compile.sh

flatpak run \
    org.flatpak.Builder $(pwd)/_build \
    --force-clean --verbose --user \
    $(pwd)/io.github.andrepg.Doit.devel.json