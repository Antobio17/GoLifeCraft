import { test, expect } from "../support/test";
import { waitForAppReady } from "../support/app-ready";
import { SEED } from "../support/seed-data";
import { DiaryPage } from "../nutrition/diary/diary/diary.page";

const backButton = ".ds-screen-head__lead";

test.describe("vuelta atrás", () => {
  test("un enlace directo a una ficha vuelve a su listado", async ({
    page,
  }) => {
    await page.goto(`/recipes/${SEED.recipes.polloConArroz.id}`);
    await waitForAppReady(page);
    await page.locator(backButton).first().click();
    await expect(page).toHaveURL(/\/recipes$/);
  });

  test("desde el listado vuelve al listado", async ({ page }) => {
    await page.goto("/recipes");
    await waitForAppReady(page);
    await page.goto(`/recipes/${SEED.recipes.polloConArroz.id}`);
    await waitForAppReady(page);
    await page.locator(backButton).first().click();
    await expect(page).toHaveURL(/\/recipes$/);
  });

  test("un listado con query params propios no se sale de la app", async ({
    page,
  }) => {
    await page.goto("/global-catalog");
    await waitForAppReady(page);
    await page.locator(backButton).first().click();
    await expect(page).toHaveURL(/\/catalog$/);
  });

  test("dos saltos vuelven uno a uno", async ({ page }) => {
    await page.goto("/catalog");
    await waitForAppReady(page);
    await page.getByTestId("article-card").first().locator("button").click();
    await expect(page).toHaveURL(/\/catalog\/[0-9a-f-]{36}/);
    await waitForAppReady(page);
    await page.locator(backButton).first().click();
    await expect(page).toHaveURL(/\/catalog$/);
  });

  test("desde el diario abre la ficha del artículo y vuelve al diario", async ({
    page,
  }) => {
    const diary = new DiaryPage(page);
    await diary.goto();

    await diary.openRecord(SEED.articles.yogur.name);

    await expect(page).toHaveURL(
      new RegExp(`/catalog/${SEED.articles.yogur.id}$`),
    );

    await page.locator(backButton).first().click();

    await expect(page).toHaveURL(/\/diary$/);
  });
});
