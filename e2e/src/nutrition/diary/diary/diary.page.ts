import { Locator, Page, expect } from "@playwright/test";
import { Ds, SHEET } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";
import { swipeToDelete } from "../../../support/gestures";

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export class DiaryPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/diary");
    await waitForAppReady(this.page);
  }

  get summary(): Locator {
    return this.ds.host("diary-summary");
  }

  get entries(): Locator {
    return this.ds.all("diary-entry");
  }

  entryNamed(name: string): Locator {
    return this.entries.filter({ hasText: name });
  }

  async consumedCalories(): Promise<number> {
    const text = (await this.summary.innerText()).replace(/\s+/g, " ");
    const match = text.match(/([\d.,]+)\s*\/\s*[\d.,]+\s*kcal/i);

    if (!match) {
      throw new Error(`El resumen no trae calorías legibles: "${text}"`);
    }

    return Number(match[1].replace(/[.,]/g, ""));
  }

  get dayLabel(): Locator {
    return this.ds.button("diary-today");
  }

  async previousDay(): Promise<void> {
    await this.ds.click("diary-prev");
    await waitForAppReady(this.page);
  }

  async nextDay(): Promise<void> {
    await this.ds.click("diary-next");
    await waitForAppReady(this.page);
  }

  async goToOwnDay(parallelIndex: number): Promise<void> {
    for (let day = 0; day <= parallelIndex; day += 1) {
      await this.previousDay();
    }
  }

  async openPicker(meal: Meal): Promise<void> {
    await this.ds.click(`diary-add-${meal}`);
    await expect(this.page.locator(SHEET)).toBeVisible();
  }

  async addQuickEntry(meal: Meal, name: string, calories: string): Promise<void> {
    await this.openPicker(meal);
    await this.ds
      .host("diary-picker-tabs")
      .locator("button")
      .last()
      .click();
    await this.ds.fill("diary-quick-name", name);
    await this.ds.fill("diary-quick-calories", calories);
    await this.ds.click("diary-quick-submit");
    await expect(this.entryNamed(name)).toBeVisible();
  }

  async removeEntry(name: string): Promise<void> {
    await swipeToDelete(this.entryNamed(name).first());
    await expect(this.entryNamed(name)).toHaveCount(0);
  }
}
