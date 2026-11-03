import { Locator, Page, Request } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";
import { ACHIEVEMENTS_PATH } from "../../../support/achievements";

export class AchievementsPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/achievements");
    await waitForAppReady(this.page);
  }

  get sections(): Locator {
    return this.ds.all("achievements-section");
  }

  get medals(): Locator {
    return this.ds.all("achievement-medal");
  }

  get recent(): Locator {
    return this.ds.host("achievements-recent");
  }

  get recentMedals(): Locator {
    return this.ds.all("achievement-recent");
  }

  medal(key: string): Locator {
    return this.page.locator(`[data-testid='achievement-medal'][data-key='${key}']`);
  }

  async filterBy(label: string): Promise<void> {
    await this.ds.host("achievements-filter").getByRole("radio", { name: label }).click();
  }

  get toast(): Locator {
    return this.ds.host("achievement-toast");
  }

  get celebration(): Locator {
    return this.ds.host("achievement-celebration");
  }

  async closeToast(): Promise<Request> {
    const seen = this.seenRequest();

    await this.toast.getByRole("button", { name: "Cerrar" }).click();

    return seen;
  }

  async celebrate(): Promise<Request> {
    const seen = this.seenRequest();

    await this.celebration.getByRole("button", { name: "¡Genial!" }).click();

    return seen;
  }

  private seenRequest(): Promise<Request> {
    return this.page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        new URL(request.url()).pathname.startsWith(`${ACHIEVEMENTS_PATH}/`) &&
        new URL(request.url()).pathname.endsWith("/seen"),
    );
  }
}
