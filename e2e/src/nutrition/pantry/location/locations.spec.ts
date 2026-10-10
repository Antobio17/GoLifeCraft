import { test, expect } from "../../../support/test";
import { LocationsPage } from "./locations.page";
import { SEED } from "../../../support/seed-data";

test.describe("ubicaciones", () => {
  test("lista las ubicaciones de la despensa", async ({ page }) => {
    const locations = new LocationsPage(page);
    await locations.goto();

    await expect(locations.cards).toHaveCount(SEED.locations.count);
    await expect(locations.cardNamed(SEED.locations.nevera.name)).toBeVisible();
    await expect(locations.cardNamed(SEED.locations.despensa.name)).toBeVisible();
  });

  test("abre la ubicación que se toca", async ({ page }) => {
    const locations = new LocationsPage(page);
    await locations.goto();

    await locations.open(SEED.locations.nevera.name);

    await expect(page).toHaveURL(
      new RegExp(`/locations/${SEED.locations.nevera.id}$`),
    );
  });
});
