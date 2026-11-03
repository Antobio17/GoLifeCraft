import { Page } from "@playwright/test";
import { test, expect } from "../../../support/test";
import { ACHIEVEMENTS_PATH } from "../../../support/achievements";
import { waitForAppReady } from "../../../support/app-ready";
import { AchievementsPage } from "./achievements.page";

const TIERS = ["bronze", "silver", "gold", "platinum"];

function achievement(
  key: string,
  module: string,
  icon: string,
  thresholds: number[],
  value: number,
  unlockedAt: string[],
  unseenTiers: string[] = [],
): object {
  const tiers = thresholds.map((threshold, index) => ({
    tier: TIERS[index],
    threshold,
    unlocked: index < unlockedAt.length,
    unlockedAt: unlockedAt[index] ?? null,
    seen: !unseenTiers.includes(TIERS[index]),
  }));
  const next = tiers.find((tier) => !tier.unlocked) ?? null;

  return {
    id: key,
    type: "Achievement",
    attributes: {
      key,
      module,
      icon,
      metric: "count",
      value,
      progressValue: value,
      activeStreak: 0,
      tiers,
      currentTier: unlockedAt.length > 0 ? TIERS[unlockedAt.length - 1] : null,
      nextTier: next?.tier ?? null,
      nextThreshold: next?.threshold ?? null,
      remaining: next ? next.threshold - value : null,
      progress: next ? value / next.threshold : 1,
      unseenTiers,
      lastUnlockedAt: unlockedAt.at(-1) ?? null,
    },
    relationships: [],
  };
}

async function mockAchievements(page: Page, data: object[]): Promise<void> {
  await page.route(`**${ACHIEVEMENTS_PATH}`, (route) =>
    route.fulfill({
      json: { meta: { pageNumber: 1, pageSize: data.length, total: data.length }, data, included: [] },
    }),
  );
  await page.route(`**${ACHIEVEMENTS_PATH}/*/seen`, (route) => route.fulfill({ status: 204 }));
}

const workouts = (value: number, unlockedAt: string[], unseenTiers: string[] = []): object =>
  achievement("gym.workouts", "gym", "dumbbell", [1, 25, 100, 250], value, unlockedAt, unseenTiers);

const meals = achievement("nutrition.meals", "nutrition", "leaf", [10, 100, 500, 1500], 4, []);

test.describe("logros", () => {
  test("la vitrina enseña cada logro del catálogo agrupado por módulo", async ({ page }) => {
    const achievements = new AchievementsPage(page);
    await achievements.goto();

    await expect(achievements.sections).toHaveCount(4);
    await expect(achievements.medals).toHaveCount(10);

    await achievements.filterBy("Gym");

    await expect(achievements.sections).toHaveCount(1);
    await expect(achievements.medals).toHaveCount(2);
  });

  test("pinta el nivel conseguido, el progreso al siguiente y los últimos logros", async ({ page }) => {
    await mockAchievements(page, [
      workouts(30, ["2026-01-10T18:00:00+00:00", "2026-01-14T18:00:00+00:00"]),
      meals,
    ]);

    const achievements = new AchievementsPage(page);
    await achievements.goto();

    await expect(achievements.medal("gym.workouts")).toContainText("Constante");
    await expect(achievements.medal("gym.workouts")).toContainText("Plata · 30/100");
    await expect(achievements.medal("nutrition.meals")).toContainText("4 / 10");
    await expect(achievements.recent).toContainText("2 / 8");
    await expect(achievements.recentMedals).toHaveCount(2);
    await expect(achievements.recentMedals.first()).toContainText("Ayer");
  });

  test("el dashboard propone el próximo logro y lleva a la vitrina", async ({ page, ds }) => {
    await mockAchievements(page, [workouts(3, ["2026-01-10T18:00:00+00:00"]), meals]);

    await page.goto("/dashboard");
    await waitForAppReady(page);

    await expect(ds.host("achievement-next")).toContainText("Buen provecho · Bronce");
    await expect(ds.host("achievement-next")).toContainText("Te faltan 6 comidas");

    await ds.host("dashboard-achievements").getByRole("button", { name: "Ver logros" }).click();

    await expect(page).toHaveURL(/\/achievements$/);
  });

  test("un logro de plata se celebra con un aviso que se marca como visto al cerrarlo", async ({ page }) => {
    await mockAchievements(page, [
      workouts(30, ["2026-01-10T18:00:00+00:00", "2026-01-15T08:00:00+00:00"], ["silver"]),
    ]);

    const achievements = new AchievementsPage(page);
    await page.goto("/dashboard");

    await expect(achievements.toast).toContainText("Logro desbloqueado · Plata");
    await expect(achievements.toast).toContainText("25 entrenos terminados");

    const seen = await achievements.closeToast();

    expect(new URL(seen.url()).pathname).toBe(`${ACHIEVEMENTS_PATH}/gym.workouts/seen`);
    await expect(achievements.toast).toHaveCount(0);
  });

  test("un logro de oro se celebra a pantalla completa", async ({ page }) => {
    await mockAchievements(page, [
      workouts(
        120,
        ["2026-01-01T18:00:00+00:00", "2026-01-05T18:00:00+00:00", "2026-01-15T08:00:00+00:00"],
        ["gold"],
      ),
    ]);

    const achievements = new AchievementsPage(page);
    await page.goto("/dashboard");

    await expect(achievements.celebration.getByRole("dialog")).toBeVisible();
    await expect(achievements.celebration).toContainText("Constante");
    await expect(achievements.celebration).toContainText("Siguiente: Platino · 250");

    const seen = await achievements.celebrate();

    expect(new URL(seen.url()).pathname).toBe(`${ACHIEVEMENTS_PATH}/gym.workouts/seen`);
    await expect(achievements.celebration).toHaveCount(0);
  });
});
