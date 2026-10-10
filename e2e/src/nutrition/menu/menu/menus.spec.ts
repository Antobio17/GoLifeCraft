import { test, expect } from "../../../support/test";
import { MenusPage } from "./menus.page";
import { SEED } from "../../../support/seed-data";

test.describe("menús", () => {
  test("el menú semanal enseña los días que tiene planificados", async ({
    page,
  }) => {
    const menus = new MenusPage(page);
    await menus.goto();

    await expect(menus.cards).toHaveCount(SEED.menus.count);
    await expect(menus.cardNamed(SEED.menus.week.name)).toContainText(
      `${SEED.menus.week.dayCount} días`,
    );
  });

  test("abre el menú que se toca", async ({ page }) => {
    const menus = new MenusPage(page);
    await menus.goto();

    await menus.open(SEED.menus.week.name);

    await expect(page).toHaveURL(
      new RegExp(`/menus/${SEED.menus.week.id}`),
    );
  });
});
