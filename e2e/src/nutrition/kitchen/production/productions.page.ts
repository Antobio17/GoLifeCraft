import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

export class ProductionsPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/kitchen");
    await waitForAppReady(this.page);
    await expect(this.lots.first()).toBeVisible();
  }

  get hero(): Locator {
    return this.ds.host("kitchen-hero");
  }

  get heroStats(): Locator {
    return this.hero.locator("ds-stat-strip");
  }

  get lots(): Locator {
    return this.ds.all("kitchen-lot-row");
  }

  async openFirstLot(): Promise<void> {
    await this.lots.first().locator("button").first().click();
  }
}
