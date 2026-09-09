import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

export const A11Y_BASELINE_PATH = resolve(HERE, "../../fixtures/a11y-baseline.json");

/**
 * Sólo WCAG 2.1 AA. Las reglas "best-practice" de axe traen opiniones
 * (landmarks, orden de encabezados) que chocan con una app de una sola columna
 * y no señalarían roturas de diseño, sólo ruido.
 */
export const A11Y_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/**
 * El baseline guarda QUÉ reglas incumple cada pantalla, no cuántos nodos.
 *
 * Se probó con conteos y no se sostiene: `color-contrast` cuenta nodos
 * pintados en ese instante y el número baila solo entre ejecuciones (9 y 12 en
 * el dashboard, 25 y 5 en la compra) según lo que haya terminado de cargar. Un
 * trinquete que salta solo no lo mira nadie a la semana. El conjunto de reglas
 * sí es estable y es lo que de verdad interesa: que no aparezca una CLASE
 * nueva de fallo — un botón de icono sin nombre, un `aria` roto, un input sin
 * etiqueta.
 */
export function readA11yBaseline(): Record<string, string[]> {
  return JSON.parse(readFileSync(A11Y_BASELINE_PATH, "utf8")) as Record<string, string[]>;
}
