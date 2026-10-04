#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

if pgrep -f "ng serve" >/dev/null; then
  step "Frontend already running on port 4200"
  exit 0
fi

install_frontend_dependencies

if [ -n "${CODESPACE_NAME:-}" ]; then
  bash .devcontainer/public-ports.sh &
fi

cd frontend
exec npx ng serve --proxy-config proxy.conf.json --host 0.0.0.0 --allowed-hosts true
