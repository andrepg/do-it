#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# compile.sh — Compila a aplicação Flatpak localmente via flatpak-builder.
#
# Uso: scripts/compile.sh [manifest.json] [build-dir]
#   manifest.json  Manifesto Flatpak a usar (default: io.github.andrepg.Doit.json)
#   build-dir      Diretório de build a usar (default: _build)
#
# Flags de limpeza:
#   --clean, -C    Limpa COMPLETAMENTE o cache (.flatpak-builder) antes de compilar
# ===========================================================================

MANIFEST="io.github.andrepg.Doit.json"
BUILD_DIR="_build"
CLEAN=false

for arg in "$@"; do
    case "$arg" in
        --clean|-C) CLEAN=true ;;
        *.json) MANIFEST="$arg" ;;
        *) BUILD_DIR="$arg" ;;
    esac
done

echo "====> Compilando manifesto: $MANIFEST → $BUILD_DIR"

if $CLEAN; then
    echo "====> Limpeza completa do cache de build..."
    rm -rf .flatpak-builder/build/* 2>/dev/null || true
    rm -rf .flatpak-builder/rofiles/*-lock 2>/dev/null || true
    rm -rf "$BUILD_DIR" 2>/dev/null || true
else
    echo "====> Limpando artefatos antigos (mantendo cache)..."
    rm -rf "$BUILD_DIR" 2>/dev/null || true
fi

echo "====> Iniciando build do Flatpak..."
flatpak run --user org.flatpak.Builder \
    --force-clean \
    "$BUILD_DIR" \
    "flatpak/$MANIFEST"

echo "====> Build concluída: $BUILD_DIR"
