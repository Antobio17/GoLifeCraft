import { Page, expect } from "@playwright/test";

export async function waitForAutosave(page: Page): Promise<void> {
  const status = page.locator(".ds-save-status").first();

  await expect(status).toHaveAttribute("data-state", "saved", { timeout: 15_000 });
}
