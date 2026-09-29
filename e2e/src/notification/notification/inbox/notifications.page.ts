import { Locator, Page, Response } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { swipeToDelete } from "../../../support/gestures";
import { waitForAppReady } from "../../../support/app-ready";

const SETTINGS_PATH = "/api/v1/notification/settings";
const INBOX_PATH = "/api/v1/notification/notifications";

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

  moduleCard(module: string): Locator {
    return this.ds.button(`notifications-module-${module}`);
  }

  async openModule(module: string): Promise<void> {
    await this.moduleCard(module).click();
    await waitForAppReady(this.page);
  }

  async openTab(label: string): Promise<void> {
    await this.ds.host("notifications-tabs").getByRole("radio", { name: label }).click();
    await waitForAppReady(this.page);
  }

  get markAllReadButton(): Locator {
    return this.ds.button("notifications-mark-all-read");
  }

  item(title: string): Locator {
    return this.items.filter({ hasText: title });
  }

  readToggle(title: string): Locator {
    return this.item(title).getByRole("button", { name: /^Marcar como (no )?leída$/ });
  }

  async openItem(title: string): Promise<void> {
    await this.item(title).getByRole("button", { name: title, exact: true }).click();
  }

  async toggleRead(title: string): Promise<Response> {
    const saved = this.page.waitForResponse(
      (response) => response.request().method() === "PUT" && new URL(response.url()).pathname.endsWith("/read"),
    );

    await this.readToggle(title).click();

    return saved;
  }

  async remove(title: string): Promise<Response> {
    const removed = this.page.waitForResponse((response) => response.request().method() === "DELETE");

    await swipeToDelete(this.item(title));

    return removed;
  }

  async markAllRead(): Promise<Response> {
    const saved = this.page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname === `${INBOX_PATH}/seen`,
    );

    await this.markAllReadButton.click();

    return saved;
  }

  async toggleQuietHours(): Promise<Response> {
    const saved = this.savedSettings();

    await this.quietHours.click();

    return saved;
  }

  private savedSettings(): Promise<Response> {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && new URL(response.url()).pathname === SETTINGS_PATH,
    );
  }
}
