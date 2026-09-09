import { test, expect } from "../support/test";
import { waitForAppReady } from "../support/app-ready";
import { freezeMotion } from "../support/motion";
import { CORE_SCREENS, SPLIT_VIEW_SCREENS } from "../support/routes";
import { DESKTOP, MOBILE, RESPONSIVE_MATRIX, TABLET } from "../support/viewports";

/**
 * Invariantes de layout que no dependen de un solo pixel. A diferencia de la
 * regresión visual, estos tests no hay que regenerarlos cuando cambia un color
 * o una sombra, y cuando fallan dicen QUÉ se ha roto en vez de "hay 4000
 * pixeles distintos".
 *
 * Los umbrales (768px para la barra lateral, 1000px para el split view) no se
 * inventan aquí: son los mismos que declaran side-drawer.component.css y
 * split-view.component.ts.
 */

const DOCKED_FROM = 768;
const TWO_COLUMNS_FROM = 1000;

async function visit(page: import("@playwright/test").Page, path: string, ready: string) {
  await page.goto(path);
  await page.waitForSelector(ready, { timeout: 20_000 });
  await waitForAppReady(page);
  await freezeMotion(page);
}

test.describe("layout responsive", () => {
  for (const screen of CORE_SCREENS) {
    for (const { name, viewport } of RESPONSIVE_MATRIX) {
      test(`${screen.name} no genera scroll horizontal en ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await visit(page, screen.path, screen.ready);

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        expect(
          overflow.scrollWidth,
          `${screen.path} desborda ${overflow.scrollWidth - overflow.clientWidth}px a lo ancho`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1);
      });

      test(`${screen.name} no deja ningún elemento fuera del viewport en ${name}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await visit(page, screen.path, screen.ready);

        // Sólo miramos componentes del design system: son los que definen la
        // caja. Y se perdona lo que viva dentro de un contenedor que scrollea
        // en horizontal a propósito (`ds-scroll-row` de la barra inferior, una
        // tabla ancha): ahí salirse del viewport es el comportamiento querido,
        // que es justo la vía de escape que da CLAUDE.md.
        const escaped = await page.evaluate((width) => {
          const offenders: string[] = [];
          const scrollsSideways = (element: Element): boolean => {
            let node: Element | null = element;

            while (node && node !== document.body) {
              const overflowX = getComputedStyle(node).overflowX;

              if (overflowX === "auto" || overflowX === "scroll") {
                return true;
              }

              node = node.parentElement;
            }

            return false;
          };

          const candidates = Array.from(
            document.querySelectorAll(
              "[class*='ds-'], ds-card, ds-product-card, ds-recipe-card, ds-shopping-item, ds-diary-entry",
            ),
          );

          for (const element of candidates) {
            const box = element.getBoundingClientRect();

            if (box.width === 0 || box.height === 0) {
              continue;
            }

            if (box.right <= width + 1 && box.left >= -1) {
              continue;
            }

            if (scrollsSideways(element)) {
              continue;
            }

            offenders.push(
              `${element.tagName.toLowerCase()}.${element.className}`.slice(0, 120),
            );
          }

          return offenders.slice(0, 5);
        }, viewport.width);

        expect(escaped, `elementos fuera del viewport en ${screen.path}`).toEqual([]);
      });
    }
  }
});

test.describe("shell: barra inferior contra barra lateral", () => {
  test(`en móvil manda la barra inferior y no hay barra lateral`, async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await visit(page, "/dashboard", "[data-testid='dashboard-greeting']");

    await expect(page.getByTestId("bottom-nav")).toBeVisible();
    await expect(page.getByTestId("drawer-docked")).toHaveCount(0);
  });

  for (const viewport of [TABLET, DESKTOP]) {
    test(`a ${viewport.width}px manda la barra lateral y la inferior se esconde`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await visit(page, "/dashboard", "[data-testid='dashboard-greeting']");

      await expect(page.getByTestId("drawer-docked")).toBeVisible();
      await expect(page.getByTestId("bottom-nav")).toBeHidden();

      const drawer = await page.getByTestId("drawer-docked").boundingBox();
      expect(drawer, "la barra lateral no tiene caja").not.toBeNull();
      expect(drawer!.x, "la barra lateral tiene que estar pegada a la izquierda").toBeLessThan(
        viewport.width / 2,
      );
    });
  }

  test(`el umbral de la barra lateral es exactamente ${DOCKED_FROM}px`, async ({ page }) => {
    await page.setViewportSize({ width: DOCKED_FROM - 1, height: 900 });
    await visit(page, "/dashboard", "[data-testid='dashboard-greeting']");
    await expect(page.getByTestId("drawer-docked")).toHaveCount(0);

    await page.setViewportSize({ width: DOCKED_FROM, height: 900 });
    await expect(page.getByTestId("drawer-docked")).toBeVisible();
  });
});

test.describe("ds-split-view: una columna abajo, dos arriba", () => {
  for (const screen of SPLIT_VIEW_SCREENS) {
    test(`${screen.name} apila las dos columnas por debajo de ${TWO_COLUMNS_FROM}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: TWO_COLUMNS_FROM - 1, height: 1000 });
      await visit(page, screen.path, screen.ready);

      const boxes = await page.evaluate(() => {
        const split = document.querySelector("ds-split-view");
        const side = split?.querySelector(".split__side")?.getBoundingClientRect();
        const main = split?.querySelector(".split__main")?.getBoundingClientRect();

        return side && main ? { side, main } : null;
      });

      expect(boxes, `${screen.path} no pinta ningún ds-split-view`).not.toBeNull();
      expect(
        boxes!.side.bottom,
        "en una columna el lateral tiene que quedar por encima del principal",
      ).toBeLessThanOrEqual(boxes!.main.top + 1);
    });

    test(`${screen.name} usa dos columnas a partir de ${TWO_COLUMNS_FROM}px`, async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await visit(page, screen.path, screen.ready);

      const layout = await page.evaluate(() => {
        const split = document.querySelector("ds-split-view");
        const sideEl = split?.querySelector(".split__side");
        const mainEl = split?.querySelector(".split__main");

        if (!sideEl || !mainEl) {
          return null;
        }

        return {
          side: sideEl.getBoundingClientRect(),
          main: mainEl.getBoundingClientRect(),
          position: getComputedStyle(sideEl).position,
        };
      });

      expect(layout, `${screen.path} no pinta ningún ds-split-view`).not.toBeNull();
      expect(
        layout!.side.right,
        "en dos columnas el lateral y el principal no se pueden solapar",
      ).toBeLessThanOrEqual(layout!.main.left + 1);
      expect(
        layout!.position,
        "la columna lateral es sticky por defecto (CLAUDE.md)",
      ).toBe("sticky");
    });
  }
});

test.describe("contenido y barra inferior no se pisan", () => {
  test("en móvil el último bloque del dashboard queda por encima de la barra", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await visit(page, "/dashboard", "[data-testid='dashboard-greeting']");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const clash = await page.evaluate(() => {
      const nav = document.querySelector("[data-testid='bottom-nav']")?.getBoundingClientRect();
      const tile = document
        .querySelector("[data-testid='dashboard-tile-shopping']")
        ?.getBoundingClientRect();

      return nav && tile ? tile.bottom - nav.top : null;
    });

    expect(clash, "no se encuentran la barra inferior o el último tile").not.toBeNull();
    expect(clash!, "el contenido queda tapado por la barra inferior").toBeLessThanOrEqual(1);
  });
});
