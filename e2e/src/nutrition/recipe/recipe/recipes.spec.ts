import { test, expect } from "../../../support/test";
import { RecipesPage } from "./recipes.page";
import { SEED } from "../../../support/seed-data";

test.describe("recetario", () => {
  test("lista la receta de la semilla con sus macros por ración", async ({ page }) => {
    const recipes = new RecipesPage(page);
    await recipes.goto();

    const card = recipes.cardNamed(SEED.recipes.polloConArroz.name);
    await expect(card).toBeVisible();
    await expect(card).toContainText(/kcal/i);
  });

  test("la búsqueda deja fuera lo que no coincide", async ({ page }) => {
    const recipes = new RecipesPage(page);
    await recipes.goto();

    await recipes.search("no existe esta receta");

    await expect(recipes.cards).toHaveCount(0);
  });

  test("el detalle muestra los ingredientes y los pasos", async ({ page }) => {
    const recipes = new RecipesPage(page);
    await recipes.goto();

    await recipes.open(SEED.recipes.polloConArroz.name);

    await expect(page.getByText(SEED.articles.pollo.name)).toBeVisible();
    await expect(page.getByText(SEED.articles.arroz.name)).toBeVisible();
    await expect(page.getByText(/Dorar la pechuga/i)).toBeVisible();
  });
});
