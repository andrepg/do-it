#!/usr/bin/env bash
set -euo pipefail

## Generate the POT template file
# @see https://rmnvgr.gitlab.io/gtk4-gjs-book/application/translation/
# @see https://docs.elementary.io/develop/writing-apps/our-first-app/translations

echo "====> Generating POT template file"
rm -rf _build_pot || true
meson setup _build_pot
meson compile -C _build_pot io.github.andrepg.Doit-pot

echo "====> Generating PO language files"
meson compile -C _build_pot io.github.andrepg.Doit-update-po

echo "====> Translation files generated."