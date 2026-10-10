import { Locator, Page, expect } from "@playwright/test";

export class Ds {
  constructor(private readonly root: Page | Locator) {}

  host(testId: string): Locator {
    return this.root.getByTestId(testId);
  }

  all(testId: string): Locator {
    return this.root.getByTestId(testId);
  }

  input(testId: string): Locator {
    return this.host(testId).locator("input").first();
  }

  textarea(testId: string): Locator {
    return this.host(testId).locator("textarea").first();
  }

  select(testId: string): Locator {
    return this.host(testId).locator("select").first();
  }

  button(testId: string): Locator {
    return this.host(testId).locator("button").first();
  }

  async fill(testId: string, value: string): Promise<void> {
    await this.input(testId).fill(value);
  }

  async choose(testId: string, value: string): Promise<void> {
    await this.select(testId).selectOption(value);
  }

  async click(testId: string): Promise<void> {
    await this.button(testId).click();
  }

  async pickDate(testId: string, iso: string): Promise<void> {
    const page = "page" in this.root ? this.root.page() : this.root;
    const calendar = page.locator(
      `${SHEET} [data-testid='date-field-calendar']`,
    );
    const target = calendar.locator(`[data-date='${iso}']`);
    const month = iso.slice(0, 7);

    await this.button(testId).click();
    await expect(calendar).toBeVisible();

    for (let step = 0; step < 24 && (await target.count()) === 0; step++) {
      const shown = await calendar
        .locator("[data-date]")
        .first()
        .getAttribute("data-date");
      const direction = (shown ?? "").slice(0, 7) < month ? "last" : "first";
      await calendar.locator(".ds-cal__navbtn")[direction]().click();
    }

    await target.click();
    await expect(calendar).toHaveCount(0);
  }
}

export const SKELETON = ".ds-sk";

export const SHEET = ".ds-sheet";

export const SHEET_CLOSE = ".ds-sheet__close";

export const SHEET_CONFIRM = ".ds-sheet [data-testid='sheet-confirm']";

export async function closeSheet(page: Page): Promise<void> {
  const sheet = page.locator(SHEET);

  if ((await sheet.count()) === 0) {
    return;
  }

  await page.locator(SHEET_CLOSE).first().click();

  if ((await sheet.count()) > 0) {
    await page.keyboard.press("Escape");
  }

  await expect(sheet).toHaveCount(0);
}
