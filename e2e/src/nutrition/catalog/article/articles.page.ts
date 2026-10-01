import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

export class ArticlesPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/catalog");
    await waitForAppReady(this.page);
  }

  get cards(): Locator {
    return this.ds.all("article-card");
  }

  cardNamed(name: string): Locator {
    return this.cards.filter({ hasText: name });
  }

  get emptyState(): Locator {
    return this.ds.host("articles-empty");
  }

  async search(term: string): Promise<void> {
    const response = this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/nutrition/catalog/articles") && res.ok(),
    );
    await this.ds.input("articles-search").fill(term);
    await response;
  }

  async filterByCategory(name: string): Promise<void> {
    const response = this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/nutrition/catalog/articles") && res.ok(),
    );
    await this.ds.choose("articles-filter-category", name);
    await response;
  }

  favoriteToggle(name: string): Locator {
    return this.cardNamed(name).locator(".ds-pcard__favorite");
  }

  async toggleFavorite(name: string): Promise<void> {
    const saved = this.page.waitForResponse(
      (res) =>
        res.url().includes("/favorite") &&
        "PUT" === res.request().method() &&
        res.ok(),
    );
    await this.favoriteToggle(name).click();
    await saved;
  }

  async filterByFavorite(label: string): Promise<void> {
    const response = this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/nutrition/catalog/articles") && res.ok(),
    );
    await this.ds
      .host("articles-filter-favorite")
      .getByRole("radio", { name: label, exact: true })
      .click();
    await response;
  }

  async open(name: string): Promise<void> {
    await this.cardNamed(name).locator("button").first().click();
    await expect(this.page).toHaveURL(/\/catalog\/[0-9a-f-]{36}/);
  }

  async startCreate(): Promise<void> {
    await this.ds.click("articles-create");
    await expect(this.page).toHaveURL(/\/catalog\/create$/);
  }
}
