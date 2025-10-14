## Generate the POT template file
# @see https://rmnvgr.gitlab.io/gtk4-gjs-book/application/translation/
# @see https://docs.elementary.io/develop/writing-apps/our-first-app/translations

cd $(pwd)

echo "Building source code first"
flatpak run --filesystem=host --command=meson org.gnome.Sdk/x86_64/49 setup --reconfigure _build

echo "Building POT template file"
flatpak run --filesystem=host --command=meson org.gnome.Sdk/x86_64/49 compile -C _build io.github.andrepg.Doit-pot

echo "Updating PO files to translation"
flatpak run --filesystem=host --command=meson org.gnome.Sdk/x86_64/49 compile -C _build io.github.andrepg.Doit-update-po

