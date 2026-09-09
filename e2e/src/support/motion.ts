import { Page } from "@playwright/test";

/**
 * Playwright ya congela `animation`, pero no las transiciones en vuelo ni el
 * scroll suave ni el caret. Sin esto la regresión visual falla una de cada
 * cinco ejecuciones por un pixel de sombra a medio camino.
 */
export async function freezeMotion(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });
}
