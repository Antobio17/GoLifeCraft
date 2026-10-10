import { test, expect } from "../../../support/test";
import { InventoriesPage } from "./inventories.page";
import { SEED } from "../../../support/seed-data";

test.describe("inventario", () => {
  test("el hero enseña el recuento abierto con su progreso", async ({ page }) => {
    const inventories = new InventoriesPage(page);
    await inventories.goto();

    await expect(inventories.rows).toHaveCount(SEED.inventories.count);
    await expect(inventories.hero).toContainText(
      `${SEED.inventories.open.countedItems}/${SEED.inventories.open.totalItems}`,
    );
  });

  test("el listado abre el recuento más reciente", async ({ page }) => {
    const inventories = new InventoriesPage(page);
    await inventories.goto();

    await inventories.openFirst();

    await expect(page).toHaveURL(
      new RegExp(`/inventory/${SEED.inventories.open.id}$`),
    );
  });
});
