#!/usr/bin/env bash
# ===========================================================================
# lib-common.sh - Common functions for Doit scripts
# ===========================================================================
# This library provides shared functions used across all build scripts.
# Source this file in any script that needs these utilities.
#
# Usage: source "$(dirname "$0")/lib-common.sh"
# ===========================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Path Functions
# -----------------------------------------------------------------------------

get_scripts_dir() {
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
}

get_project_root() {
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
}

# -----------------------------------------------------------------------------
# Logging Functions
# -----------------------------------------------------------------------------

log_section() {
    echo "====> $1"
}

log_action() {
    echo "==> $1"
}

log_error() {
    echo "ERROR: $1" >&2
}

log_warning() {
    echo "WARNING: $1" >&2
}

# -----------------------------------------------------------------------------
# Flatpak Builder Functions
# -----------------------------------------------------------------------------

run_flatpak_builder() {
    local build_dir="$1"
    local manifest="$2"
    shift 2

    flatpak run --user org.flatpak.Builder \
        --force-clean \
        "$@" \
        "$build_dir" \
        "flatpak/$manifest"
}

run_flatpak_builder_no_clean() {
    local build_dir="$1"
    local manifest="$2"
    shift 2

    flatpak run --user org.flatpak.Builder \
        "$@" \
        "$build_dir" \
        "flatpak/$manifest"
}

# -----------------------------------------------------------------------------
# Argument Parsing Functions
# -----------------------------------------------------------------------------

parse_flags() {
    local -a opts=()
    local -a longopts=()
    local short=""
    local var_name="$1"
    shift

    for arg in "$@"; do
        if [[ "$arg" == :* ]]; then
            short="${arg:1}"
        else
            longopts+=("$arg")
        fi
    done

    local opts_string=""
    for opt in "${opts[@]:-}"; do
        opts_string+="$opt"
    done

    echo "$opts_string"
}

# -----------------------------------------------------------------------------
# Cleanup Functions
# -----------------------------------------------------------------------------

clean_build_dir() {
    local build_dir="${1:-_build}"
    if [[ -d "$build_dir" ]]; then
        rm -rf "$build_dir"
        log_action "Cleaned $build_dir"
    fi
}

clean_flatpak_builder_cache() {
    rm -rf .flatpak-builder/build/* 2>/dev/null || true
    rm -rf .flatpak-builder/rofiles/*-lock 2>/dev/null || true
    log_action "Cleaned flatpak-builder cache"
}

# -----------------------------------------------------------------------------
# Manifest Functions
# -----------------------------------------------------------------------------

get_app_id_from_manifest() {
    local manifest="$1"
    local app_id

    if [[ "$manifest" == *"Devel"* ]]; then
        app_id="io.github.andrepg.Doit.Devel"
    else
        app_id="io.github.andrepg.Doit"
    fi

    echo "$app_id"
}

# -----------------------------------------------------------------------------
# Version Extraction Functions
# -----------------------------------------------------------------------------

get_version_from_meson() {
    local project_root="${1:-$(get_project_root)}"
    local version_file="$project_root/VERSION"

    if [[ -f "$version_file" ]]; then
        echo "$(cat "$version_file")"
    else
        echo "unknown"
    fi
}