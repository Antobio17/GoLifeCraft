import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

export class ArticlePage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(id: string): Promise<void> {
    await this.page.goto(`/catalog/${id}`);
    await waitForAppReady(this.page);
  }

  get header(): Locator {
    return this.ds.host("article-header");
  }

  get hero(): Locator {
    return this.ds.host("article-hero");
  }

  get macros(): Locator {
    return this.ds.host("article-macros");
  }

  get nutrition(): Locator {
    return this.ds.host("article-nutrition");
  }

  get units(): Locator {
    return this.ds.host("article-units");
  }

  get purchase(): Locator {
    return this.ds.host("article-purchase");
  }

  async edit(): Promise<void> {
    await this.ds.click("article-edit");
    await expect(this.page).toHaveURL(/\/catalog\/[0-9a-f-]{36}\/edit$/);
  }

  /**
   * El borrado pasa por `ds-confirm-action-modal`, que es del design system:
   * el mismo par de testids sirve para cualquier borrado de la app.
   */
  async deleteAndConfirm(): Promise<void> {
    await this.ds.click("article-delete");
    await expect(this.ds.button("confirm-accept")).toBeVisible();
    await this.ds.click("confirm-accept");
    await expect(this.page).toHaveURL(/\/catalog$/);
  }
}
