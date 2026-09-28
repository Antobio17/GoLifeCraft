import { Locator, Page, Response } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

const SETTINGS_PATH = "/api/v1/notification/settings";

export class NotificationsPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(tab: "inbox" | "settings" = "inbox"): Promise<void> {
    await this.page.goto(tab === "settings" ? "/notifications?tab=settings" : "/notifications");
    await waitForAppReady(this.page);
  }

  get emptyState(): Locator {
    return this.ds.host("notifications-empty");
  }

  get items(): Locator {
    return this.ds.all("notification-item");
  }

  get quietHours(): Locator {
    return this.ds.button("notifications-quiet-toggle");
  }

  get dayBeforeReminder(): Locator {
    return this.ds.button("notifications-preference-dayBefore");
  }

  get upcomingReminder(): Locator {
    return this.ds.button("notifications-preference-upcoming");
  }

  async openTab(label: string): Promise<void> {
    await this.ds.host("notifications-tabs").getByRole("radio", { name: label }).click();
    await waitForAppReady(this.page);
  }

  async openItem(title: string): Promise<void> {
    await this.items.filter({ hasText: title }).locator("button").first().click();
  }

  async toggleQuietHours(): Promise<Response> {
    const saved = this.page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && new URL(response.url()).pathname === SETTINGS_PATH,
    );

    await this.quietHours.click();

    return saved;
  }
}
