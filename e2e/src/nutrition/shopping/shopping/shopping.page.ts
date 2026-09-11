import { Locator, Page, expect } from "@playwright/test";
import { Ds, closeSheet } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";
import { waitForAutosave } from "../../../support/autosave";

export class ShoppingPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/shopping-list");
    await waitForAppReady(this.page);
  }

  get items(): Locator {
    return this.ds.all("shopping-item");
  }

  itemNamed(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  get summary(): Locator {
    return this.ds.host("shopping-summary");
  }

  async addCustomItem(name: string): Promise<void> {
    await this.ds.click("shopping-add");
    await expect(this.ds.input("shopping-custom-name")).toBeVisible();
    await this.ds.fill("shopping-custom-name", name);
    await this.ds.click("shopping-custom-add");
    await expect(this.itemNamed(name)).toHaveCount(1);
    await closeSheet(this.page);
    await expect(this.itemNamed(name).first()).not.toHaveAttribute(
      "data-id",
      /^pending-/,
    );
    await expect(this.itemNamed(name)).toBeVisible();
  }

  async toggle(name: string): Promise<void> {
    await this.itemNamed(name).first().getByTestId("shopping-item-toggle").click();
    await waitForAutosave(this.page);
  }

  async increment(name: string): Promise<void> {
    await this.itemNamed(name).first().getByTestId("shopping-item-increment").click();
    await waitForAutosave(this.page);
  }

  async expectChecked(name: string, checked: boolean): Promise<void> {
    await expect(
      this.itemNamed(name).first().getByTestId("shopping-item-toggle"),
    ).toHaveAttribute("aria-pressed", String(checked));
  }
}
