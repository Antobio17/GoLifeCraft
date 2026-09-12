import { test, expect } from "../support/test";
import { SEED } from "../support/seed-data";
import { DiaryPage } from "../nutrition/diary/diary/diary.page";
import { Ds } from "../support/ds";

test.describe("abrir la ficha", () => {
  test("el desglose de una receta se abre pulsando la tarjeta y sus hijos enlazan", async ({
    page,
  }, testInfo) => {
    const diary = new DiaryPage(page);
    const ds = new Ds(page);
    await diary.goto();
    await diary.goToOwnDay(testInfo.parallelIndex);

    await diary.openPicker("dinner");
    await ds.host("diary-picker-tabs").locator("button").nth(1).click();
    const row = ds
      .all("diary-picker-row")
      .filter({ hasText: SEED.recipes.polloConArroz.name })
      .first();
    await row.getByTestId("diary-picker-add").locator("button").click();

    const entry = diary.entryNamed(SEED.recipes.polloConArroz.name).first();
    await expect(entry).toBeVisible();

    await expect(page.locator("ds-diary-tree")).toHaveCount(0);

    await diary.expandBreakdown(SEED.recipes.polloConArroz.name);
    await expect(page.locator("ds-diary-tree")).toHaveCount(1);

    const child = page
      .locator("ds-diary-tree ds-pressable.diary-tree__open button")
      .filter({ hasText: SEED.articles.arroz.name })
      .first();
    await expect(child).toBeVisible();
    await child.click();

    await expect(page).toHaveURL(
      new RegExp(`/catalog/${SEED.articles.arroz.id}$`),
    );
  });
});
