import { fileURLToPath } from "node:url";
import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

const PHOTO = fileURLToPath(
  new URL("../../../../fixtures/ticket-photo.jpg", import.meta.url),
);

export interface DraftLineStub {
  rawName: string;
  quantity: number;
  rawUnit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
}

export interface DraftStub {
  storeName: string;
  supermarketId: string | null;
  purchasedOn: string;
  total: number | null;
  lines: DraftLineStub[];
}

export class ScanTicketPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/tickets/scan");
    await waitForAppReady(this.page);
    await expect(this.ds.host("scan-ticket-analyze")).toBeVisible();
  }

  async stubDraft(draft: DraftStub): Promise<void> {
    await this.page.route("**/tickets/draft", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            fromCache: false,
            draft,
            lowConfidenceFields: [],
            notes: [],
          },
        }),
      }),
    );
  }

  async addPhoto(): Promise<void> {
    await this.page
      .locator("ds-photo-capture input[type='file']")
      .setInputFiles(PHOTO);
    await expect(this.ds.button("scan-ticket-analyze")).toBeEnabled();
  }

  async analyze(): Promise<void> {
    await this.ds.click("scan-ticket-analyze");
    await expect(this.ds.host("scan-ticket-save")).toBeVisible();
  }

  get lines(): Locator {
    return this.ds.all("scan-ticket-line");
  }

  lineNamed(rawName: string): Locator {
    return this.lines.filter({ hasText: rawName });
  }

  get storeName(): Locator {
    return this.ds.input("scan-ticket-store");
  }

  get total(): Locator {
    return this.ds.input("scan-ticket-total");
  }

  async removeLine(rawName: string): Promise<void> {
    await this.lineNamed(rawName).getByRole("button").last().click();
  }

  async save(): Promise<void> {
    const created = this.page.waitForResponse(
      (response) =>
        "POST" === response.request().method() &&
        response.url().endsWith("/shopping/tickets"),
    );

    await this.ds.click("scan-ticket-save");
    await created;
  }

  get saveButton(): Locator {
    return this.ds.button("scan-ticket-save");
  }
}
