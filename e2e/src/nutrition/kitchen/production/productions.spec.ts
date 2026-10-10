import { test, expect } from "../../../support/test";
import { ProductionsPage } from "./productions.page";
import { SEED } from "../../../support/seed-data";

test.describe("cocina", () => {
  test("el hero propone cocinar lo que el diario pide para los próximos días", async ({
    page,
  }) => {
    const kitchen = new ProductionsPage(page);
    await kitchen.goto();

    await expect(kitchen.hero).toContainText(SEED.recipes.polloConArroz.name);
    await expect(kitchen.heroStats).toContainText(
      String(SEED.kitchen.proposal.recipesToCook),
    );
    await expect(kitchen.heroStats).toContainText(
      String(SEED.kitchen.proposal.servingsToCook),
    );
  });

  test("el listado abre el lote que se toca", async ({ page }) => {
    const kitchen = new ProductionsPage(page);
    await kitchen.goto();

    await expect(kitchen.lots).toHaveCount(SEED.kitchen.lotCount);
    await kitchen.openFirstLot();

    await expect(page).toHaveURL(
      new RegExp(`/kitchen/${SEED.kitchen.doneLot.id}$`),
    );
  });
});
