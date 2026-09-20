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

  get stock(): Locator {
    return this.ds.host("article-stock");
  }

  get stockLevel(): Locator {
    return this.stock.locator("ds-chip");
  }

  get stockConfidence(): Locator {
    return this.stock.locator('[role="progressbar"]');
  }

  async openStockEditor(): Promise<void> {
    await this.ds.click("article-stock");
    await expect(this.ds.host("stock-confirm")).toBeVisible();
  }

  get stockAmount(): Locator {
    return this.ds.input("stock-amount");
  }

  async chooseQuickAmount(label: string): Promise<void> {
    await this.chooseOption("stock-quick", label);
  }

  async typeAmount(value: string): Promise<void> {
    await this.ds.fill("stock-amount", value);
  }

  async swapAmountUnit(): Promise<void> {
    await this.ds.host("stock-amount").locator("button").first().click();
  }

  async chooseTracking(label: string): Promise<void> {
    await this.chooseOption("stock-tracking", label);
  }

  async confirmStock(): Promise<void> {
    await this.ds.click("stock-confirm");
  }

  private async chooseOption(testId: string, label: string): Promise<void> {
    await this.ds
      .host(testId)
      .getByRole("radio", { name: label, exact: true })
      .click();
  }

  async edit(): Promise<void> {
    await this.ds.click("article-edit");
    await expect(this.page).toHaveURL(/\/catalog\/[0-9a-f-]{36}\/edit$/);
  }

  async deleteAndConfirm(): Promise<void> {
    await this.ds.click("article-delete");
    await expect(this.ds.button("confirm-accept")).toBeVisible();
    await this.ds.click("confirm-accept");
    await expect(this.page).toHaveURL(/\/catalog$/);
  }
}
