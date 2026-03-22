#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "====> Validating Flatpak layout"

MANIFEST="${1:-io.github.andrepg.Doit.json}"

bash ./scripts/compile.sh "$MANIFEST"

echo "====> Validating Metainfo"
flatpak run --command=flatpak-builder-lint org.flatpak.Builder appstream _build/files/share/metainfo/io.github.andrepg.Doit.metainfo.xml || true

echo "====> Validating Manifest"
flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest "flatpak/$MANIFEST" || true