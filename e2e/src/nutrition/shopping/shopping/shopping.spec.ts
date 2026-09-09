import { test, expect } from "../../../support/test";
import { ShoppingPage } from "./shopping.page";

test.describe("lista de la compra", () => {
  test("añade un artículo suelto, lo marca y lo deja marcado tras recargar", async ({ page }) => {
    const shopping = new ShoppingPage(page);
    const name = `E2E Compra ${Date.now()}`;
    await shopping.goto();

    await shopping.addCustomItem(name);
    await expect(shopping.summary).toBeVisible();

    await shopping.toggle(name);
    await shopping.expectChecked(name, true);

    // La lista se guarda sola: recargar es la única forma de comprobar que el
    // check viajó al servidor y no se quedó en la señal del componente.
    await shopping.goto();
    await shopping.expectChecked(name, true);
  });

  test("el stepper sube la cantidad del artículo", async ({ page }) => {
    const shopping = new ShoppingPage(page);
    const name = `E2E Cantidad ${Date.now()}`;
    await shopping.goto();

    await shopping.addCustomItem(name);
    await shopping.increment(name);

    await expect(shopping.itemNamed(name).locator("ds-chip")).toHaveText("2");
  });
});
