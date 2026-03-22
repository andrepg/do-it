#!/usr/bin/env bash
set -euo pipefail
clear

# Parse options
COMPILE=false
WATCH=false
while getopts "cw-:" opt; do
    case $opt in
        c) COMPILE=true ;;
        w) WATCH=true ;;
        -) case "${OPTARG}" in
               compile) COMPILE=true ;;
               watch) WATCH=true ;;
               *) echo "Invalid option: --${OPTARG}" >&2; exit 1 ;;
           esac ;;
        *) echo "Usage: $0 [-c|--compile] [-w|--watch] <manifest.json>" >&2; exit 1 ;;
    esac
done
shift $((OPTIND-1))

MANIFEST="${1:?Usage: $0 [-c|--compile] [-w|--watch] <manifest.json>}"
BUILD_DIR="_build"

APP_COMMAND="${MANIFEST%.json}"
SCRIPTS_PATH="$(cd "$(dirname "$0")" && pwd)"

function build_and_run() {
    clear
    if $COMPILE; then
        echo "==> Invoking compilation script"
        "$SCRIPTS_PATH/compile.sh" "$MANIFEST" "$BUILD_DIR"
    fi

    echo "==> Running application (without installing)"
    flatpak run --user org.flatpak.Builder --run "$BUILD_DIR" "flatpak/$MANIFEST" "$APP_COMMAND" --development=true
}

if $WATCH; then
    while true; do
        build_and_run || true
        echo ""
        echo "==> Press [R] to restart or any other key to quit..."
        read -r -n 1 -s key || key="q"
        if [[ $key == "r" || $key == "R" ]]; then
            echo "==> Restarting in 2 seconds..."
            sleep 2
        else
            break
        fi
    done
else
    build_and_run
fi