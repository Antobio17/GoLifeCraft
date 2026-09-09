#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Adopta de una vez los tres baselines de una pantalla NUEVA.
#
#   ./scripts/adopt.sh
#
# Una pantalla recién dada de alta en src/support/routes.ts falla a la primera
# en tres sitios a la vez, y cada uno se adopta con un comando distinto: no
# tiene snapshots, no está en el baseline de accesibilidad y puede estrenar
# etiquetas nativas. Esto los recorre en orden y enseña qué ha cambiado.
#
# CUÁNDO NO USARLO — y es lo importante:
#
#   Esto NO es para poner en verde una suite que se ha puesto roja. Si falla
#   una pantalla que ya existía, el fallo es la información: alguien movió un
#   pixel, empeoró un contraste o metió un <div>. Adoptar el baseline ahí borra
#   justo lo que había que mirar. Primero se entiende el diff (`npm run report`)
#   y sólo después se decide.
#
#   Con las etiquetas nativas no hay decisión posible: el baseline de
#   native-tags SÓLO baja. Si sube, se crea el componente <ds-*> que falta.
# ---------------------------------------------------------------------------
set -euo pipefail

E2E_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$E2E_DIR/.." && pwd)"
BASE_URL="${E2E_BASE_URL:-http://localhost:4200}"

cd "$E2E_DIR"

die() { echo "✖ $1" >&2; exit 1; }

curl -sSf -o /dev/null "$BASE_URL" 2>/dev/null \
  || die "No hay nada escuchando en $BASE_URL. Levanta el front con \`npm start\` en frontend/."

echo "▸ 1/3  Etiquetas nativas"
BEFORE_NATIVE="$(cat fixtures/native-tags-baseline.json)"
npm run --silent baseline:native-tags

# El baseline de etiquetas nativas sólo puede bajar. Si esta pantalla ha metido
# etiquetas nuevas, adoptarlas sería saltarse la regla de CLAUDE.md por la
# puerta de atrás, así que se revierte y se avisa.
if ! diff <(echo "$BEFORE_NATIVE") fixtures/native-tags-baseline.json >/dev/null; then
  if node -e "
    const before = $BEFORE_NATIVE;
    const after = require('./fixtures/native-tags-baseline.json');
    const grew = Object.entries(after).filter(([f, n]) => n > (before[f] ?? 0));
    if (grew.length) {
      console.error('  ✖ etiquetas HTML nativas nuevas: ' + grew.map(([f, n]) => f + ' (' + n + ')').join(', '));
      process.exit(1);
    }
  "; then
    echo "  ✔ deuda de etiquetas nativas actualizada (a la baja)"
  else
    echo "$BEFORE_NATIVE" > fixtures/native-tags-baseline.json
    die "Baseline revertido. Crea el componente <ds-*> que falta en shared/design-system en vez de adoptar la deuda."
  fi
else
  echo "  ✔ sin cambios"
fi

echo "▸ 2/3  Accesibilidad"
npm run --silent baseline:a11y >/dev/null
echo "  ✔ fixtures/a11y-baseline.json actualizado"

echo "▸ 3/3  Capturas (Docker)"
npm run --silent update-snapshots >/dev/null
echo "  ✔ snapshots actualizados"

echo
echo "▸ Esto es lo que ha cambiado. Revísalo ANTES de commitear:"
git -C "$ROOT_DIR" status --porcelain -- e2e/fixtures e2e/snapshots \
  | sed 's/^/    /' \
  || true
echo
echo "  Las capturas se miran de verdad, no se dan por buenas: abre las PNG nuevas"
echo "  y comprueba que la pantalla se ve como querías."
