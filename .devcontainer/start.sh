#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LOG_FILE="/tmp/golifecraft-frontend.log"

[ -f .env.local ] || exit 0

docker compose --env-file .env.local -f docker-compose.yml -f .devcontainer/docker-compose.codespace.yml up -d nginx php db

if pgrep -f "ng serve" >/dev/null; then
  exit 0
fi

cd frontend
nohup npx ng serve --proxy-config proxy.conf.json --host 0.0.0.0 --allowed-hosts true \
  > "$LOG_FILE" 2>&1 &

echo "▸ Frontend starting on port 4200 (log: $LOG_FILE)"
