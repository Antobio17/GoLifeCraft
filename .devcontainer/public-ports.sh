#!/usr/bin/env bash
# Codespaces has no devcontainer.json setting for port visibility, so make the
# frontend and API ports public with the GitHub CLI once they are forwarded.

PORTS=(4200:public 8083:public)

[ -n "${CODESPACE_NAME:-}" ] || exit 0
command -v gh >/dev/null || { echo "▸ gh not installed, ports stay private"; exit 0; }

for _ in $(seq 1 12); do
  if gh codespace ports visibility "${PORTS[@]}" -c "$CODESPACE_NAME" >/dev/null 2>&1; then
    echo "▸ Ports ${PORTS[*]}"
    exit 0
  fi
  sleep 5
done

echo "▸ Could not make ports public (run: gh codespace ports visibility ${PORTS[*]} -c \$CODESPACE_NAME)"
