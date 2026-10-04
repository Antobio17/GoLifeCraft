#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

[ -f .env.local ] || exit 0

docker compose --env-file .env.local -f docker-compose.yml -f .devcontainer/docker-compose.codespace.yml up -d nginx php db
