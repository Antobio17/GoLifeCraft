import { Page } from "@playwright/test";

export const FIXED_DATE = new Date("2026-01-15T09:00:00.000Z");

export async function startClockAt(page: Page, time: Date = FIXED_DATE): Promise<void> {
  await page.clock.install({ time });
  await page.clock.resume();
}
