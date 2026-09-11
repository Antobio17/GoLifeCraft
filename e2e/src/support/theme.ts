import { Page } from "@playwright/test";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "app-theme";

export async function withTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [THEME_STORAGE_KEY, theme] as const,
  );
}

export async function currentTheme(page: Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute("data-theme"));
}
