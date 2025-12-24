#!/usr/bin/env bash
set -euo pipefail

MANIFEST="${1:?Use: compile.sh <manifest-file.json>}"
BUILD_DIR=".build"

echo "====> Cleaning build directory"
rm -rf .flatpak-builder/build/*
rm -rf "$BUILD_DIR"


echo "====> Compiling Flatpak application"
flatpak run --user org.flatpak.Builder --force-clean "$BUILD_DIR" "$MANIFEST" -- --development=true
