import { Page, expect } from "@playwright/test";
import { SKELETON } from "./ds";

export async function waitForAppReady(page: Page): Promise<void> {
  await expect(page.locator(SKELETON)).toHaveCount(0, { timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}
