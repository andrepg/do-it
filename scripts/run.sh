#!/usr/bin/env bash
set -euo pipefail
clear

MANIFEST="${1:?Uso: run.sh <manifest.json>}"
BUILD_DIR=".build"

APP_COMMAND="io.github.andrepg.Doit"
SCRIPTS_PATH="$(cd "$(dirname "$0")" && pwd)"

echo "==> Compiling application"
"$SCRIPTS_PATH/compile.sh" "$MANIFEST" "$BUILD_DIR"

echo "==> Running application (without installing)"
flatpak run --user org.flatpak.Builder --run "$BUILD_DIR" "$MANIFEST" "$APP_COMMAND"