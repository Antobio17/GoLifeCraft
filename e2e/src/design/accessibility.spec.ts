import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";
import { test, expect } from "../support/test";
import { waitForAppReady } from "../support/app-ready";
import { CORE_SCREENS } from "../support/routes";
import { A11Y_BASELINE_PATH, A11Y_TAGS, readA11yBaseline } from "../support/a11y";

/**
 * Accesibilidad como red de seguridad del diseño, no como certificación: un
 * botón de icono que se queda sin nombre o un `aria` roto son roturas reales
 * que la comparación por pixeles no distingue de un cambio querido.
 *
 * La app arrastra deuda (contrastes flojos, el `meta viewport` que bloquea el
 * zoom), así que esto es un trinquete y no un "pasa o no pasa": cada pantalla
 * tiene en fixtures/a11y-baseline.json las reglas que hoy incumple. Falla si
 * aparece una regla nueva, y falla también si desaparece una, para obligar a
 * bajar el listón con `npm run baseline:a11y` y que la deuda no vuelva a subir.
 */

const WRITING_BASELINE = process.env.E2E_WRITE_A11Y_BASELINE === "1";

async function brokenRules(page: import("@playwright/test").Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags([...A11Y_TAGS]).analyze();

  return results.violations.map((violation) => violation.id).sort();
}

test.describe("accesibilidad", () => {
  test.skip(WRITING_BASELINE, "regenerando el baseline");

  for (const screen of CORE_SCREENS) {
    test(`${screen.name} no estrena fallos de WCAG 2.1 AA`, async ({ page }) => {
      await page.goto(screen.path);
      await page.waitForSelector(screen.ready, { timeout: 20_000 });
      await waitForAppReady(page);

      const current = await brokenRules(page);
      const baseline = readA11yBaseline()[screen.name] ?? [];

      expect(
        current.filter((rule) => !baseline.includes(rule)),
        `reglas de accesibilidad nuevas en ${screen.path}`,
      ).toEqual([]);

      expect(
        baseline.filter((rule) => !current.includes(rule)),
        `has arreglado accesibilidad en ${screen.path}: fija el nuevo mínimo con "npm run baseline:a11y"`,
      ).toEqual([]);
    });
  }
});

/**
 * Regeneración del baseline (`npm run baseline:a11y`). Vive en el mismo fichero
 * que el trinquete para que nadie cambie la forma de medir en un sitio y se
 * olvide del otro.
 */
test("regenera el baseline de accesibilidad", async ({ page }) => {
  test.skip(!WRITING_BASELINE, "sólo con E2E_WRITE_A11Y_BASELINE=1");

  const baseline: Record<string, string[]> = {};

  for (const screen of CORE_SCREENS) {
    await page.goto(screen.path);
    await page.waitForSelector(screen.ready, { timeout: 20_000 });
    await waitForAppReady(page);

    baseline[screen.name] = await brokenRules(page);
  }

  writeFileSync(A11Y_BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`✔ Baseline de accesibilidad actualizado en ${A11Y_BASELINE_PATH}`);
});
