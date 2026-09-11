import { Locator, Page, expect } from "@playwright/test";
import { Ds, SHEET } from "../../../support/ds";
import { swipeToDelete } from "../../../support/gestures";
import { waitForAppReady } from "../../../support/app-ready";

export class TicketsPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/tickets");
    await waitForAppReady(this.page);
    await expect(this.cards.first()).toBeVisible();
  }

  async open(ticketId: string): Promise<void> {
    await this.page.goto(`/tickets/${ticketId}`);
    await waitForAppReady(this.page);
    await expect(this.lines.first()).toBeVisible();
  }

  get cards(): Locator {
    return this.ds.all("ticket-card");
  }

  get lines(): Locator {
    return this.ds.all("ticket-line");
  }

  lineNamed(rawName: string): Locator {
    return this.lines.filter({ hasText: rawName });
  }

  async expectLinkedTo(rawName: string, articleName: string): Promise<void> {
    await expect(this.lineNamed(rawName).locator(".ds-tline__name")).toHaveText(
      articleName,
    );
  }

  async expectPending(rawName: string): Promise<void> {
    await expect(this.lineNamed(rawName)).toHaveAttribute("linked", "false");
  }

  async expectReceived(rawName: string): Promise<void> {
    await expect(this.lineNamed(rawName)).toHaveAttribute("received", "true");
  }

  async increaseQuantity(rawName: string): Promise<void> {
    const saved = this.page.waitForResponse(
      (response) =>
        "PUT" === response.request().method() &&
        response.url().includes("/items/"),
    );

    await this.lineNamed(rawName).locator(".ds-tline__step").first().click();
    await saved;
  }

  async expectAdds(rawName: string, amount: string): Promise<void> {
    await expect(this.lineNamed(rawName)).toContainText(amount, {
      timeout: 15_000,
    });
  }

  async linkThroughPicker(
    rawName: string,
    articleName: string,
    buttonName: string,
  ): Promise<void> {
    await this.lineNamed(rawName)
      .getByRole("button", { name: buttonName })
      .click();
    await expect(this.page.locator(SHEET)).toBeVisible();

    await this.ds.fill("ticket-picker-search", articleName);

    const card = this.ds
      .all("ticket-picker-article")
      .filter({ hasText: articleName });
    await expect(card.first()).toBeVisible();
    await card.first().getByRole("button").last().click();

    await expect(this.page.locator(SHEET)).toHaveCount(0);
  }

  async removeLine(rawName: string): Promise<void> {
    await swipeToDelete(this.lineNamed(rawName).first());
  }

  async receive(): Promise<void> {
    await this.ds.click("ticket-receive");
  }

  get receiveButton(): Locator {
    return this.ds.host("ticket-receive");
  }

  async unreceive(): Promise<void> {
    await this.ds.click("ticket-unreceive");
  }

  get unreceiveButton(): Locator {
    return this.ds.host("ticket-unreceive");
  }

  async expectCannotReceive(): Promise<void> {
    await expect(this.ds.button("ticket-receive")).toBeDisabled();
  }
}
