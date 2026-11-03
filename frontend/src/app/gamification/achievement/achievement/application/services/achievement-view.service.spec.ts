import { AchievementViewService } from "./achievement-view.service";
import { Achievement } from "../../domain/models/achievement.model";
import { AchievementFilter } from "../../domain/models/achievement-filter.enum";
import { AchievementMetric } from "../../domain/models/achievement-metric.enum";
import { AchievementModule } from "../../domain/models/achievement-module.enum";
import { AchievementTier } from "../../domain/models/achievement-tier.enum";

describe("AchievementViewService", () => {
  const service = new AchievementViewService();

  const t = (key: string, params?: Record<string, unknown>): string =>
    params ? `${key}|${JSON.stringify(params)}` : key;

  const TIERS = [
    AchievementTier.Bronze,
    AchievementTier.Silver,
    AchievementTier.Gold,
    AchievementTier.Platinum,
  ];

  const achievement = (
    key: string,
    module: AchievementModule,
    unlockedAt: (string | null)[],
    overrides: Partial<Achievement> = {},
  ): Achievement => {
    const tiers = TIERS.map((tier, index) => ({
      tier,
      threshold: [1, 10, 50, 100][index],
      unlocked: null !== (unlockedAt[index] ?? null),
      unlockedAt: unlockedAt[index] ?? null,
      seen: true,
    }));
    const unlocked = tiers.filter((tier) => tier.unlocked);
    const next = tiers.find((tier) => !tier.unlocked) ?? null;

    return {
      key,
      module,
      icon: "dumbbell",
      metric: AchievementMetric.Count,
      value: 5,
      progressValue: 5,
      activeStreak: 0,
      tiers,
      currentTier: unlocked.at(-1)?.tier ?? null,
      nextTier: next?.tier ?? null,
      nextThreshold: next?.threshold ?? null,
      remaining: next ? next.threshold - 5 : null,
      progress: next ? Math.min(1, 5 / next.threshold) : 1,
      unseenTiers: [],
      lastUnlockedAt: unlocked.at(-1)?.unlockedAt ?? null,
      ...overrides,
    };
  };

  const gym = achievement("gym.workouts", AchievementModule.Gym, [
    "2026-11-01T18:00:00+00:00",
  ]);
  const meals = achievement("nutrition.meals", AchievementModule.Nutrition, []);
  const tasks = achievement("agenda.tasks_done", AchievementModule.Agenda, [
    "2026-10-20T10:00:00+00:00",
    "2026-11-03T09:00:00+00:00",
  ]);

  it("counts unlocked tiers over every tier", () => {
    expect(service.tally([gym, meals, tasks])).toEqual({
      unlocked: 3,
      total: 12,
    });
  });

  it("groups the cards by module in a fixed order and honours the filter", () => {
    const all = service.sections([tasks, meals, gym], AchievementFilter.All, t);
    const onlyGym = service.sections(
      [tasks, meals, gym],
      AchievementFilter.Gym,
      t,
    );

    expect(all.map((section) => section.module)).toEqual([
      AchievementModule.Gym,
      AchievementModule.Nutrition,
      AchievementModule.Agenda,
    ]);
    expect(onlyGym.map((section) => section.module)).toEqual([
      AchievementModule.Gym,
    ]);
  });

  it("shows a progress bar only on locked medals", () => {
    const [gymCard] = service.sections([gym], AchievementFilter.All, t)[0]
      .cards;
    const [mealsCard] = service.sections([meals], AchievementFilter.All, t)[0]
      .cards;

    expect(gymCard.tier).toBe(AchievementTier.Bronze);
    expect(gymCard.progress).toBeNull();
    expect(mealsCard.tier).toBeNull();
    expect(mealsCard.progress).toBe(1);
  });

  it("lists the latest unlocks first and labels how long ago they were", () => {
    const recent = service.recent(
      [gym, meals, tasks],
      new Date("2026-11-03T12:00:00"),
      t,
    );

    expect(recent.map((item) => `${item.key}:${item.tier}`)).toEqual([
      "agenda.tasks_done:silver",
      "gym.workouts:bronze",
      "agenda.tasks_done:bronze",
    ]);
    expect(recent[0].when).toBe("achievements.recent.today");
    expect(recent[1].when).toBe('achievements.recent.daysAgo|{"count":2}');
  });

  it("picks the pending achievement closest to its next tier", () => {
    const close = achievement(
      "finance.transactions",
      AchievementModule.Finance,
      [],
      {
        progress: 0.9,
        remaining: 1,
      },
    );
    const done = achievement("nutrition.recipes", AchievementModule.Nutrition, [
      "a",
      "b",
      "c",
      "d",
    ]);

    expect(service.next([gym, close, done])?.key).toBe("finance.transactions");
    expect(service.next([done])).toBeNull();
  });
});
