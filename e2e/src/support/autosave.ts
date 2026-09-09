import { Page, expect } from "@playwright/test";

/**
 * El diario y la lista de la compra no tienen botón de guardar: `AutosaveService`
 * espera 400 ms y manda la escritura sola. Navegar antes de eso cancela el
 * timer y el cambio se pierde, así que cualquier test que toque y recargue
 * tiene que pasar por aquí.
 *
 * El estado se lee de `ds-save-status`, que ya expone `data-state` con el valor
 * del enum (`idle` | `saving` | `saved` | `error`): no hace falta un testid.
 */
export async function waitForAutosave(page: Page): Promise<void> {
  const status = page.locator(".ds-save-status").first();

  await expect(status).toHaveAttribute("data-state", "saved", { timeout: 15_000 });
}
