import { Locator } from "@playwright/test";

const SWIPE_SURFACE = ".swipe__surface";
const SWIPE_DELETE = ".swipe__delete";

/**
 * Las filas de diario y de compra se borran deslizando: `ds-swipe-to-delete`
 * deja el botón de la papelera DEBAJO de la fila y sólo asoma cuando el
 * contenido se desplaza. Sin el gesto, Playwright encuentra el botón, lo ve
 * "visible" y falla porque la propia fila le tapa el punto de click.
 *
 * El gesto va con el ratón real y en varios pasos a propósito: el componente
 * ignora los desplazamientos menores de 8px y los que van más en vertical que
 * en horizontal, así que un único salto no dispara nada.
 */
export async function swipeToDelete(row: Locator): Promise<void> {
  const page = row.page();
  const surface = row.locator(SWIPE_SURFACE).first();
  const box = await surface.boundingBox();

  if (!box) {
    throw new Error("La fila no tiene caja: ¿se ha desmontado antes del gesto?");
  }

  const y = box.y + box.height / 2;
  const from = box.x + box.width - 12;

  await page.mouse.move(from, y);
  await page.mouse.down();
  await page.mouse.move(from - 30, y, { steps: 5 });
  await page.mouse.move(from - 90, y, { steps: 5 });
  await page.mouse.up();

  await row.locator(SWIPE_DELETE).first().click();
}
