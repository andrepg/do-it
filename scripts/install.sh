#!/usr/bin/env bash
set -euo pipefail
clear

# Parse options
COMPILE=false
while getopts "c-:" opt; do
    case $opt in
        c) COMPILE=true ;;
        -) case "${OPTARG}" in
               compile) COMPILE=true ;;
               *) echo "Invalid option: --${OPTARG}" >&2; exit 1 ;;
           esac ;;
        *) echo "Usage: $0 [-c|--compile] <manifest.json>" >&2; exit 1 ;;
    esac
done
shift $((OPTIND-1))

MANIFEST="${1:?Usage: $0 [-c|--compile] <manifest.json>}"
BUILD_DIR="_build"

APP_COMMAND="io.github.andrepg.Doit"
SCRIPTS_PATH="$(cd "$(dirname "$0")" && pwd)"

if $COMPILE; then
    echo "==> Invoking Compilation script"
    "$SCRIPTS_PATH/compile.sh" "$MANIFEST" "$BUILD_DIR"
fi

echo "==> Running application (without installing)"
flatpak run --user org.flatpak.Builder --run "$BUILD_DIR" "$MANIFEST" "$APP_COMMAND"