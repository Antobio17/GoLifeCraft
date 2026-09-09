import { test, expect } from "../../../support/test";
import { DiaryPage } from "./diary.page";
import { SEED } from "../../../support/seed-data";

test.describe("diario", () => {
  test("abre en el día de hoy con el objetivo de la semilla", async ({ page }) => {
    const diary = new DiaryPage(page);
    await diary.goto();

    await expect(diary.summary).toBeVisible();
    await expect(diary.summary).toContainText(String(SEED.goal.calories));
  });

  test("navega a ayer y vuelve a hoy", async ({ page }) => {
    const diary = new DiaryPage(page);
    await diary.goto();
    const today = await diary.dayLabel.textContent();

    await diary.previousDay();
    await expect(diary.dayLabel).not.toHaveText(today ?? "");

    await diary.nextDay();
    await expect(diary.dayLabel).toHaveText(today ?? "");
  });

  test("una entrada rápida suma al total y se puede borrar", async ({ page }, testInfo) => {
    const diary = new DiaryPage(page);
    const name = `E2E Rápido ${Date.now()}`;
    await diary.goto();
    await diary.goToOwnDay(testInfo.parallelIndex);
    const before = await diary.consumedCalories();

    await diary.addQuickEntry("breakfast", name, "350");

    await expect
      .poll(() => diary.consumedCalories(), { timeout: 10_000 })
      .toBe(before + 350);

    await diary.removeEntry(name);

    await expect.poll(() => diary.consumedCalories(), { timeout: 10_000 }).toBe(before);
  });
});
