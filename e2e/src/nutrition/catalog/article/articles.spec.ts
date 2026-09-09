import { test, expect } from "../../../support/test";
import { ArticlesPage } from "./articles.page";
import { ArticlePage } from "./article.page";
import { ArticleEditorPage } from "./article-editor.page";
import { SEED } from "../../../support/seed-data";

test.describe("catálogo", () => {
  test("lista los artículos de la semilla", async ({ page }) => {
    const articles = new ArticlesPage(page);
    await articles.goto();

    await expect(articles.cards).toHaveCount(Object.keys(SEED.articles).length);
    await expect(articles.cardNamed(SEED.articles.yogur.name)).toBeVisible();
  });

  test("la búsqueda filtra contra el servidor y se recupera al vaciarla", async ({ page }) => {
    const articles = new ArticlesPage(page);
    await articles.goto();

    await articles.search("Brócoli");
    await expect(articles.cards).toHaveCount(1);
    await expect(articles.cardNamed(SEED.articles.brocoli.name)).toBeVisible();

    await articles.search("");
    await expect(articles.cards).toHaveCount(Object.keys(SEED.articles).length);
  });

  test("la búsqueda ignora acentos y mayúsculas", async ({ page }) => {
    const articles = new ArticlesPage(page);
    await articles.goto();

    await articles.search("brocoli");

    await expect(articles.cardNamed(SEED.articles.brocoli.name)).toBeVisible();
  });

  test("el filtro por categoría deja sólo los artículos de esa categoría", async ({ page }) => {
    const articles = new ArticlesPage(page);
    await articles.goto();

    await articles.filterByCategory(SEED.categories.carnes.name);

    await expect(articles.cards).toHaveCount(1);
    await expect(articles.cardNamed(SEED.articles.pollo.name)).toBeVisible();
  });

  test("el detalle pinta macros, unidades y compra", async ({ page }) => {
    const articles = new ArticlesPage(page);
    const article = new ArticlePage(page);

    await articles.goto();
    await articles.open(SEED.articles.yogur.name);

    await expect(article.header).toContainText(SEED.articles.yogur.name);
    await expect(article.hero).toBeVisible();
    await expect(article.macros).toBeVisible();
    await expect(article.nutrition).toBeVisible();
    await expect(article.units).toBeVisible();
    await expect(article.purchase).toBeVisible();
  });

  test("crear y borrar un artículo deja el catálogo como estaba", async ({ page }) => {
    const articles = new ArticlesPage(page);
    const editor = new ArticleEditorPage(page);
    const article = new ArticlePage(page);
    const name = `E2E Temporal ${Date.now()}`;

    await articles.goto();
    const before = await articles.cards.count();

    await articles.startCreate();
    await editor.fill({
      name,
      brand: "E2E Marca",
      price: "2.50",
      category: SEED.categories.lacteos.name,
      calories: "150",
      protein: "10",
      fat: "5",
      carbs: "12",
    });
    await editor.save();

    await expect(page).toHaveURL(/\/catalog(\/[0-9a-f-]{36})?$/);
    await articles.goto();
    await expect(articles.cardNamed(name)).toBeVisible();
    await expect(articles.cards).toHaveCount(before + 1);

    await articles.open(name);
    await article.deleteAndConfirm();

    await articles.goto();
    await expect(articles.cardNamed(name)).toHaveCount(0);
    await expect(articles.cards).toHaveCount(before);
  });
});
