import { Page, expect } from "@playwright/test";
import { SKELETON } from "./ds";

/**
 * Una pantalla está lista cuando no queda ningún skeleton pintando y la fuente
 * de iconos ya resolvió. Sin esto, cualquier screenshot compara contra el
 * estado de carga y parpadea entre ejecuciones.
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await expect(page.locator(SKELETON)).toHaveCount(0, { timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}
