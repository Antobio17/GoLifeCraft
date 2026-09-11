import { Page } from "@playwright/test";
import { test, expect } from "../support/test";
import { waitForAppReady } from "../support/app-ready";
import { freezeMotion } from "../support/motion";
import { hideFixedChrome } from "../support/chrome";
import { withTheme } from "../support/theme";
import { CORE_SCREENS } from "../support/routes";
import { DESKTOP, MOBILE } from "../support/viewports";
import { SEED } from "../support/seed-data";


const VIEWPORTS = [
  { name: "mobile", viewport: MOBILE },
  { name: "desktop", viewport: DESKTOP },
] as const;

function themeOf(projectName: string): "light" | "dark" {
  return projectName.endsWith("dark") ? "dark" : "light";
}

async function settle(page: Page, path: string, ready: string): Promise<void> {
  await page.goto(path);
  await page.waitForSelector(ready, { timeout: 20_000 });
  await waitForAppReady(page);
  await freezeMotion(page);
}

test.describe("pantallas del núcleo", () => {
  for (const screen of CORE_SCREENS) {
    for (const { name, viewport } of VIEWPORTS) {
      test(`${screen.name} en ${name}`, async ({ page }, testInfo) => {
        await withTheme(page, themeOf(testInfo.project.name));
        await page.setViewportSize(viewport);
        await settle(page, screen.path, screen.ready);
        await hideFixedChrome(page);

        await expect(page).toHaveScreenshot(`${screen.name}-${name}.png`, {
          fullPage: true,
        });
      });
    }
  }
});

test.describe("armazón", () => {
  for (const { name, viewport } of VIEWPORTS) {
    test(`barras de navegación en ${name}`, async ({ page }, testInfo) => {
      await withTheme(page, themeOf(testInfo.project.name));
      await page.setViewportSize(viewport);
      await settle(page, "/dashboard", "[data-testid='dashboard-greeting']");

      await expect(page).toHaveScreenshot(`shell-${name}.png`);
    });
  }
});

test.describe("detalle de artículo", () => {
  for (const { name, viewport } of VIEWPORTS) {
    test(`detalle de producto en ${name}`, async ({ page }, testInfo) => {
      await withTheme(page, themeOf(testInfo.project.name));
      await page.setViewportSize(viewport);
      await settle(
        page,
        `/catalog/${SEED.articles.yogur.id}`,
        "[data-testid='article-hero']",
      );
      await hideFixedChrome(page);

      await expect(page).toHaveScreenshot(`article-detail-${name}.png`, {
        fullPage: true,
      });
    });
  }
});

test.describe("login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const { name, viewport } of VIEWPORTS) {
    test(`tarjeta de acceso en ${name}`, async ({ page }, testInfo) => {
      await withTheme(page, themeOf(testInfo.project.name));
      await page.setViewportSize(viewport);
      await page.goto("/login");
      await page.waitForSelector("[data-testid='login-submit']", { timeout: 20_000 });
      await page.evaluate(() => document.fonts.ready);
      await freezeMotion(page);

      await expect(page.locator("ds-auth-card")).toHaveScreenshot(`login-card-${name}.png`);
    });
  }
});
