#!/usr/bin/env bash
set -euo pipefail

cd $(pwd)

sh ./scripts/compile.sh

flatpak run --command=flatpak-builder-lint org.flatpak.Builder appstream _build/files/share/metainfo/io.github.andrepg.Doit.metainfo.xml