#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Lanza la suite dentro del contenedor oficial de Playwright.
#
#   ./scripts/docker-test.sh                       toda la suite
#   ./scripts/docker-test.sh --update-snapshots    regenera las capturas
#   ./scripts/docker-test.sh --project=visual-dark sólo un proyecto
#
# Los snapshots de la regresión visual SÓLO valen si se generan aquí: el
# antialiasing de las fuentes cambia entre máquinas y sacar las capturas en el
# host las dejaría atadas a este equipo. Todo lo demás (flujos, guards de
# layout, accesibilidad) se puede lanzar en local con `npm test`.
#
# El servidor de Angular y la API se quedan FUERA del contenedor: éste entra a
# la red del host, así que ve el `ng serve` del programador y el nginx de
# Docker en el 8083 sin levantar nada nuevo.
# ---------------------------------------------------------------------------
set -euo pipefail

die() { echo "✖ $1" >&2; exit 1; }

E2E_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$E2E_DIR/.." && pwd)"

# La imagen va clavada a la versión de @playwright/test REALMENTE INSTALADA, no
# al rango del package.json: con "^1.56.0" instalado como 1.62.1 pediríamos una
# imagen con navegadores de otra versión y Playwright ni arranca. Y una imagen
# más nueva que el runner reescribiría todos los snapshots.
PLAYWRIGHT_VERSION="$(node -p "require('$E2E_DIR/node_modules/@playwright/test/package.json').version" 2>/dev/null || true)"
[ -n "$PLAYWRIGHT_VERSION" ] || die "No hay @playwright/test instalado. Lanza \`npm ci\` en e2e/."
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble"

BASE_URL="${E2E_BASE_URL:-http://localhost:4200}"
API_URL="${E2E_API_URL:-http://localhost:8083}"

command -v docker >/dev/null 2>&1 || die "Docker no está instalado."

curl -sSf -o /dev/null "$BASE_URL" 2>/dev/null \
  || die "No hay nada escuchando en $BASE_URL. Levanta el front con \`npm start\` en frontend/."

curl -sSf -o /dev/null "$API_URL/api/login" -X POST -H 'Content-Type: application/json' -d '{}' 2>/dev/null \
  || curl -sS -o /dev/null -w '' "$API_URL" 2>/dev/null \
  || die "No hay API en $API_URL. Levanta los contenedores con \`make up\`."

# La semilla se carga aquí, desde el host: dentro del contenedor no hay
# cliente de Docker con el que hablar con MySQL.
if [ "${E2E_SKIP_SEED:-0}" != "1" ]; then
  "$E2E_DIR/scripts/seed.sh"
fi

echo "▸ Imagen: $IMAGE"
echo "▸ Front:  $BASE_URL   API: $API_URL"

# `-t` sólo si hay terminal: en CI (y cuando lanza el agente) no la hay y
# `docker run -it` aborta con "the input device is not a TTY".
TTY_FLAG=()
[ -t 0 ] && TTY_FLAG=(-it)

docker run --rm "${TTY_FLAG[@]}" \
  --network host \
  --ipc host \
  -v "$ROOT_DIR:$ROOT_DIR" \
  -w "$E2E_DIR" \
  -e CI="${CI:-}" \
  -e E2E_BASE_URL="$BASE_URL" \
  -e E2E_API_URL="$API_URL" \
  -e E2E_NO_WEBSERVER=1 \
  -e E2E_SKIP_SEED=1 \
  -u "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  "$IMAGE" \
  npx playwright test "$@"
