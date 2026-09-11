import { Page } from "@playwright/test";

export async function hideFixedChrome(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      [data-testid="bottom-nav"],
      [data-testid="drawer-docked"],
      app-active-workout-banner,
      ds-floating-workout-banner,
      app-floating-toast {
        visibility: hidden !important;
      }
    `,
  });
}
