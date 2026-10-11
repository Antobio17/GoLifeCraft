import { test, expect } from "../../../support/test";
import { InventoriesPage } from "./inventories.page";
import { SEED } from "../../../support/seed-data";

test.describe("inventario", () => {
  test("el listado enseña el progreso de cada recuento", async ({ page }) => {
    const inventories = new InventoriesPage(page);
    await inventories.goto();

    await expect(inventories.rows).toHaveCount(SEED.inventories.count);
    await expect(inventories.rows.first()).toContainText(
      `${SEED.inventories.open.countedItems}/${SEED.inventories.open.totalItems}`,
    );
  });

  test("la cabecera lleva a las ubicaciones", async ({ page }) => {
    const inventories = new InventoriesPage(page);
    await inventories.goto();

    await inventories.openLocations();

    await expect(page).toHaveURL(/\/locations$/);
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
