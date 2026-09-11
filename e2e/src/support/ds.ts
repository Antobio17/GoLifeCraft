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
}

export const SKELETON = ".ds-sk";

export const SHEET = ".ds-sheet";

export const SHEET_CLOSE = ".ds-sheet__close";

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
