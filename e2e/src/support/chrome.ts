import { Page } from "@playwright/test";

/**
 * Esconde el armazón fijo (barra inferior, barra lateral acoplada, banner de
 * entreno, toasts) antes de una captura de página completa.
 *
 * Hace falta porque una captura `fullPage` pinta los elementos `position: fixed`
 * una sola vez, en el sitio que ocupaban en el viewport inicial: la barra
 * inferior acaba incrustada a media página tapando el contenido que hay
 * debajo, que así no se verificaría nunca. El armazón no se queda sin cubrir:
 * lo comprueban las capturas de "shell" (viewport, sin scroll) y los guards de
 * layout, que miden sus posiciones y sus umbrales.
 *
 * Se oculta con `visibility` y no con `display` a propósito: la barra lateral
 * acoplada es una columna del layout y quitarla del flujo movería toda la
 * página.
 */
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
