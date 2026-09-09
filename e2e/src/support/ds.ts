import { Locator, Page, expect } from "@playwright/test";

/**
 * El design system envuelve controles nativos dentro de un custom element
 * `<ds-*>`. El `data-testid` se pone siempre en el host `<ds-*>`, porque es lo
 * único que la plantilla puede tocar sin romper la regla de "nada de etiquetas
 * HTML nativas". Estos helpers bajan del host al control real, para que los
 * page objects no repitan `.locator("input")` por todas partes.
 */
export class Ds {
  constructor(private readonly root: Page | Locator) {}

  host(testId: string): Locator {
    return this.root.getByTestId(testId);
  }

  /** Todas las apariciones de un testid repetido (filas de una lista). */
  all(testId: string): Locator {
    return this.root.getByTestId(testId);
  }

  input(testId: string): Locator {
    return this.host(testId).locator("input").first();
  }

  textarea(testId: string): Locator {
    return this.host(testId).locator("textarea").first();
  }

  select(testId: string): Locator {
    return this.host(testId).locator("select").first();
  }

  /** `<ds-button>` renderiza un `<button>` real: click y estado salen de ahí. */
  button(testId: string): Locator {
    return this.host(testId).locator("button").first();
  }

  async fill(testId: string, value: string): Promise<void> {
    await this.input(testId).fill(value);
  }

  async choose(testId: string, value: string): Promise<void> {
    await this.select(testId).selectOption(value);
  }

  async click(testId: string): Promise<void> {
    await this.button(testId).click();
  }
}

/** El shimmer de todos los `<ds-skeleton-*>` comparte la clase `.ds-sk`. */
export const SKELETON = ".ds-sk";

/**
 * `ds-modal-sheet` no pinta el panel dentro de su propio host: lo saca al
 * `<body>` para que ningún `overflow` ni `transform` de un ancestro lo recorte.
 * Por eso los sheets se buscan por clase y NUNCA como `ds-modal-sheet .ds-sheet`,
 * que no encuentra nada.
 */
export const SHEET = ".ds-sheet";

export const SHEET_CLOSE = ".ds-sheet__close";

/**
 * Cerrar un sheet no es "clicar el aspa": justo después de una acción el panel
 * se repinta y el click se pierde contra un nodo que ya no existe, el overlay
 * se queda montado y el siguiente click del test choca contra él sin que
 * Playwright lo cante. Cerramos y esperamos a que el panel desaparezca de
 * verdad, con Escape como red de seguridad.
 */
export async function closeSheet(page: Page): Promise<void> {
  const sheet = page.locator(SHEET);

  if ((await sheet.count()) === 0) {
    return;
  }

  await page.locator(SHEET_CLOSE).first().click();

  if ((await sheet.count()) > 0) {
    await page.keyboard.press("Escape");
  }

  await expect(sheet).toHaveCount(0);
}
