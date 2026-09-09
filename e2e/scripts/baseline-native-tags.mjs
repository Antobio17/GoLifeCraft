#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Vuelve a fijar el mínimo de etiquetas HTML nativas por template.
//
// Se ejecuta a mano (`npm run baseline:native-tags`) SÓLO después de limpiar
// deuda: el guard de design-system.spec.ts falla tanto si aparece una etiqueta
// nueva como si desaparece una sin bajar el listón, para que la deuda no pueda
// volver a subir por la puerta de atrás.
// ---------------------------------------------------------------------------
import { writeFileSync } from "node:fs";
import { countNativeTags, BASELINE_PATH } from "../src/support/native-tags.ts";

const counts = countNativeTags();
const sorted = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));

writeFileSync(BASELINE_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");

const total = Object.values(sorted).reduce((sum, count) => sum + count, 0);
console.log(`✔ Baseline actualizado: ${Object.keys(sorted).length} ficheros, ${total} etiquetas.`);
