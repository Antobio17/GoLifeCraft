import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

export class RecipesPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/recipes");
    await waitForAppReady(this.page);
  }

  get cards(): Locator {
    return this.ds.all("recipe-card");
  }

  cardNamed(name: string): Locator {
    return this.cards.filter({ hasText: name });
  }

  /** El listado de recetas filtra en cliente: no hay respuesta que esperar. */
  async search(term: string): Promise<void> {
    await this.ds.input("recipes-search").fill(term);
  }

  async open(name: string): Promise<void> {
    await this.cardNamed(name).locator("button").first().click();
    await expect(this.page).toHaveURL(/\/recipes\/[0-9a-f-]{36}/);
    await waitForAppReady(this.page);
  }
}
