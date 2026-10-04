#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env.local"
SERVICES=(nginx php db)
PHP_CONTAINER="golifecraft_php"
DB_CONTAINER="golifecraft_mysql"
LOCK_STAMP="frontend/node_modules/.package-lock.sha256"

step() { echo "▸ $1"; }

compose() { docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f .devcontainer/docker-compose.codespace.yml "$@"; }

php_console() { docker exec "$PHP_CONTAINER" php bin/console "$@"; }

lock_hash() { sha256sum frontend/package-lock.json | cut -d' ' -f1; }

install_frontend_dependencies() {
  if [ -f "$LOCK_STAMP" ] && [ "$(cat "$LOCK_STAMP")" = "$(lock_hash)" ]; then
    step "Frontend dependencies already up to date"
    return
  fi

  step "Installing frontend dependencies"
  (cd frontend && npm ci --no-audit --no-fund)
  lock_hash > "$LOCK_STAMP"
}
