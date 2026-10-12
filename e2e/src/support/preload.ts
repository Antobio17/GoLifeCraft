import { Page } from "@playwright/test";

export async function disableRoutePreloading(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(window, "requestIdleCallback", { value: () => 0 });
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
    });
  });
}
