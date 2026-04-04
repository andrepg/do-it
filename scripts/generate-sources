#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# generate-sources.sh — Gera o arquivo de fontes offline para dependências
#                       Node.js do projeto, conforme padrão Flathub.
#
# Requer: pipx ou pip com flatpak-node-generator instalado
#
# Uso: scripts/generate-sources.sh
#   O arquivo flatpak/generated-sources.json será gerado automaticamente.
# ===========================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

LOCKFILE="$PROJECT_ROOT/yarn.lock"
OUTPUT="$PROJECT_ROOT/flatpak/generated-sources.json"

echo "====> Verificando flatpak-node-generator..."

if ! command -v flatpak-node-generator &>/dev/null; then
    echo "====> flatpak-node-generator não encontrado. Instalando via pipx..."
    if command -v pipx &>/dev/null; then
        pipx install git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node
    elif command -v pip3 &>/dev/null; then
        pip3 install --user git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node
    else
        echo "Erro: pip3 ou pipx são necessários para instalar o flatpak-node-generator." >&2
        exit 1
    fi
fi

echo "====> Gerando fontes offline a partir de $LOCKFILE..."
flatpak-node-generator \
    --output "$OUTPUT" \
    yarn \
    "$LOCKFILE"

echo "====> Fontes geradas com sucesso em: $OUTPUT"
echo "      Adicione o arquivo ao controle de versão (git add flatpak/generated-sources.json)"
echo "      e atualize-o sempre que o yarn.lock mudar."
