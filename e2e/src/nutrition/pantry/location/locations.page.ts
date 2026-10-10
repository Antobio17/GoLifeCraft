import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

export class LocationsPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/locations");
    await waitForAppReady(this.page);
    await expect(this.cards.first()).toBeVisible();
  }

  get cards(): Locator {
    return this.ds.all("location-card");
  }

  cardNamed(name: string): Locator {
    return this.cards.filter({ hasText: name });
  }

  async open(name: string): Promise<void> {
    await this.cardNamed(name).first().locator("button").first().click();
  }
}
