#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

[ -n "${CODESPACES:-}" ] || exit 0

if pgrep -f "ng serve" >/dev/null; then
  step "Frontend already running on port 4200"
  exit 0
fi

step "Waiting for frontend dependencies"
until [ -f "$LOCK_STAMP" ] && [ "$(cat "$LOCK_STAMP")" = "$(lock_hash)" ]; do
  sleep 5
done

cd frontend
exec npx ng serve --proxy-config proxy.conf.json --host 0.0.0.0 --allowed-hosts true
