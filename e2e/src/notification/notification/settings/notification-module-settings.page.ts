import { Locator, Page, Response } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

const SETTINGS_PATH = "/api/v1/notification/settings";

export class NotificationModuleSettingsPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(module: string): Promise<void> {
    await this.page.goto(`/notifications/settings/${module}`);
    await waitForAppReady(this.page);
  }

  reminder(key: string): Locator {
    return this.ds.button(`notifications-preference-${key}`);
  }

  time(key: string): Locator {
    return this.ds.input(`notifications-preference-${key}-time`);
  }

  get upcomingLead(): Locator {
    return this.ds.select("notifications-preference-upcoming-lead");
  }

  async toggle(key: string): Promise<Response> {
    const saved = this.savedSettings();

    await this.reminder(key).click();

    return saved;
  }

  async chooseUpcomingLead(minutes: string): Promise<Response> {
    const saved = this.savedSettings();

    await this.upcomingLead.selectOption(minutes);

    return saved;
  }

  private savedSettings(): Promise<Response> {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && new URL(response.url()).pathname === SETTINGS_PATH,
    );
  }
}
