import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

export class InventoriesPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/inventory");
    await waitForAppReady(this.page);
    await expect(this.rows.first()).toBeVisible();
  }

  get hero(): Locator {
    return this.ds.host("inventories-hero");
  }

  get rows(): Locator {
    return this.ds.all("inventory-row");
  }

  async openFirst(): Promise<void> {
    await this.rows.first().locator("button").first().click();
  }
}
