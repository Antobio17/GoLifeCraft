#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Hook Stop: no dejar cerrar un turno que ha tocado el frontend sin verificar
# la suite end to end.
#
# CLAUDE.md dice que hay que hacerlo, pero eso es una instrucción que el modelo
# sigue, no una garantía. Esto lo ejecuta Claude Code, así que no depende de
# que se acuerde.
#
# No hace bucle: `stop_hook_active` llega a true cuando este hook YA bloqueó y
# Claude siguió trabajando. Bloquear otra vez dejaría la sesión atascada, porque
# los ficheros del frontend siguen modificados hasta que se commitean —
# verificarlos no los limpia. Así que avisa una vez por turno y se aparta.
#
# Se usa python3 y no jq: jq no está instalado en esta máquina.
# ---------------------------------------------------------------------------
set -uo pipefail

INPUT="$(cat)"

if printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(1)
sys.exit(0 if data.get('stop_hook_active') else 1)
"; then
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
CHANGED="$(git -C "$ROOT" status --porcelain -- frontend/src/app 2>/dev/null || true)"

if [ -z "$CHANGED" ]; then
  exit 0
fi

printf '%s' "$CHANGED" | python3 -c "
import json, sys

files = [line[3:] for line in sys.stdin.read().splitlines() if line.strip()]
shown = '\n'.join(f'  - {f}' for f in files[:8])
more = f'\n  …y {len(files) - 8} más' if len(files) > 8 else ''

print(json.dumps({
    'decision': 'block',
    'reason': (
        'Hay cambios sin verificar en el frontend:\n'
        f'{shown}{more}\n\n'
        'Antes de cerrar, invoca la skill /e2e: comprueba el entorno, decide qué '
        'correr y sabe interpretar los fallos. En corto es \`cd e2e && npm test\` '
        'y \`npm run test:visual\`.\n\n'
        'Si la regresión visual falla, MIRA EL DIFF antes de tocar nada '
        '(\`npm run report\`): regenerar capturas para tapar un fallo que no se '
        'ha entendido destruye lo único que hace útil esa capa. Cuenta al '
        'usuario qué pantallas cambiaron.\n\n'
        'Si ya lo has verificado en este turno, dilo con el resultado y termina.'
    ),
}))
"
