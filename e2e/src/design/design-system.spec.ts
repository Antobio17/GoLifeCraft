import { test, expect } from "../support/test";
import { waitForAppReady } from "../support/app-ready";
import { CORE_SCREENS } from "../support/routes";
import { countNativeTags, readBaseline } from "../support/native-tags";
import { withTheme } from "../support/theme";

/**
 * Guards del design system. No miran pixeles: miran que las reglas de
 * CLAUDE.md se sigan cumpliendo y que la app no esté enseñando andamios
 * (claves de traducción crudas, tokens sin resolver).
 */

test.describe("etiquetas nativas fuera del design system", () => {
  test("ningún template estrena una etiqueta HTML nativa", async () => {
    const current = countNativeTags();
    const baseline = readBaseline();

    const regressions = Object.entries(current)
      .filter(([file, count]) => count > (baseline[file] ?? 0))
      .map(([file, count]) => `${file}: ${baseline[file] ?? 0} → ${count}`);

    expect(
      regressions,
      "hay etiquetas HTML nativas nuevas. Crea el componente <ds-*> que falte en shared/design-system en vez de tirar de <div>/<span>/<button>",
    ).toEqual([]);
  });

  test("la deuda de etiquetas nativas no ha bajado sin actualizar el baseline", async () => {
    const current = countNativeTags();
    const baseline = readBaseline();

    const improvements = Object.entries(baseline)
      .filter(([file, count]) => (current[file] ?? 0) < count)
      .map(([file, count]) => `${file}: ${count} → ${current[file] ?? 0}`);

    expect(
      improvements,
      'has limpiado deuda: fija el nuevo mínimo con "npm run baseline:native-tags" para que no se pueda volver atrás',
    ).toEqual([]);
  });
});

test.describe("nada de andamios a la vista", () => {
  for (const screen of CORE_SCREENS) {
    test(`${screen.name} no enseña claves de traducción sin traducir`, async ({ page }) => {
      await page.goto(screen.path);
      await page.waitForSelector(screen.ready, { timeout: 20_000 });
      await waitForAppReady(page);

      // Una clave sin traducir se pinta tal cual: "getDiary.goal.open". Nada de
      // lo que la app enseña de verdad tiene esa forma (sin espacios, en
      // notación de puntos y empezando por minúscula).
      const raw = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const suspicious = new Set<string>();
        const key = /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/;

        while (walker.nextNode()) {
          const text = walker.currentNode.textContent?.trim() ?? "";

          if (key.test(text)) {
            suspicious.add(text);
          }
        }

        return [...suspicious];
      });

      expect(raw, `claves i18n sin traducir en ${screen.path}`).toEqual([]);
    });
  }
});

test.describe("tokens del design system", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`los tokens base resuelven en tema ${theme}`, async ({ page }) => {
      await withTheme(page, theme);
      await page.goto("/dashboard");
      await page.waitForSelector("[data-testid='dashboard-greeting']", { timeout: 20_000 });

      const unresolved = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        const tokens = [
          "--ds-space-1",
          "--ds-space-3",
          "--ds-space-5",
          "--ds-radius-lg",
          "--ds-radius-xl",
          "--ds-root-font-size",
        ];

        return tokens.filter((token) => style.getPropertyValue(token).trim() === "");
      });

      expect(unresolved, `tokens sin definir en tema ${theme}`).toEqual([]);
    });

    test(`el body pinta fondo propio en tema ${theme}`, async ({ page }) => {
      await withTheme(page, theme);
      await page.goto("/dashboard");
      await page.waitForSelector("[data-testid='dashboard-greeting']", { timeout: 20_000 });

      const background = await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      );

      expect(background, "el body no puede quedarse transparente").not.toBe(
        "rgba(0, 0, 0, 0)",
      );
    });
  }

  test("el tema oscuro cambia de verdad el fondo", async ({ page }) => {
    await withTheme(page, "light");
    await page.goto("/dashboard");
    await page.waitForSelector("[data-testid='dashboard-greeting']", { timeout: 20_000 });
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await withTheme(page, "dark");
    await page.goto("/dashboard");
    await page.waitForSelector("[data-testid='dashboard-greeting']", { timeout: 20_000 });
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    expect(dark).not.toBe(light);
  });
});
