import { Achievement } from "../../domain/models/achievement.model";
import { AchievementCard } from "../../domain/models/achievement-card.model";
import { AchievementFilter } from "../../domain/models/achievement-filter.enum";
import { AchievementModule } from "../../domain/models/achievement-module.enum";
import { AchievementSection } from "../../domain/models/achievement-section.model";
import { AchievementTally } from "../../domain/models/achievement-tally.model";
import { AchievementTier } from "../../domain/models/achievement-tier.enum";
import { RecentAchievement } from "../../domain/models/recent-achievement.model";

type Translate = (key: string, params?: Record<string, unknown>) => string;

const MODULE_ORDER: AchievementModule[] = [
  AchievementModule.Gym,
  AchievementModule.Nutrition,
  AchievementModule.Finance,
  AchievementModule.Agenda,
];

const RECENT_LIMIT = 3;
const DAY_MS = 86_400_000;

export class AchievementViewService {
  name(achievement: Pick<Achievement, "key">, t: Translate): string {
    return t(`achievements.catalog.${achievement.key}.name`);
  }

  description(key: string, threshold: number, t: Translate): string {
    return t(`achievements.catalog.${key}.description`, { count: threshold });
  }

  remaining(achievement: Achievement, t: Translate): string {
    if (null === achievement.remaining) {
      return t("achievements.next.completed");
    }

    return t(`achievements.catalog.${achievement.key}.remaining`, {
      count: achievement.remaining,
    });
  }

  tierLabel(tier: AchievementTier, t: Translate): string {
    return t(`achievements.tier.${tier}`);
  }

  card(achievement: Achievement, t: Translate): AchievementCard {
    return {
      key: achievement.key,
      icon: achievement.icon,
      tier: achievement.currentTier,
      name: this.name(achievement, t),
      caption: this.caption(achievement, t),
      progress: null === achievement.currentTier ? achievement.progress : null,
    };
  }

  tally(achievements: Achievement[]): AchievementTally {
    return achievements.reduce<AchievementTally>(
      (tally, achievement) => ({
        unlocked:
          tally.unlocked +
          achievement.tiers.filter((tier) => tier.unlocked).length,
        total: tally.total + achievement.tiers.length,
      }),
      { unlocked: 0, total: 0 },
    );
  }

  sections(
    achievements: Achievement[],
    filter: AchievementFilter,
    t: Translate,
  ): AchievementSection[] {
    return MODULE_ORDER.filter(
      (module) =>
        AchievementFilter.All === filter || (module as string) === filter,
    )
      .map((module) => {
        const inModule = achievements.filter(
          (achievement) => achievement.module === module,
        );
        const tally = this.tally(inModule);

        return {
          module,
          title: t(`achievements.module.${module}`),
          count: t("achievements.section.count", { ...tally }),
          cards: inModule.map((achievement) => this.card(achievement, t)),
        };
      })
      .filter((section) => section.cards.length > 0);
  }

  recent(
    achievements: Achievement[],
    now: Date,
    t: Translate,
  ): RecentAchievement[] {
    return achievements
      .flatMap((achievement) =>
        achievement.tiers
          .filter((tier) => tier.unlocked && null !== tier.unlockedAt)
          .map((tier) => ({
            key: achievement.key,
            icon: achievement.icon,
            tier: tier.tier,
            name: this.name(achievement, t),
            unlockedAt: new Date(tier.unlockedAt as string),
          })),
      )
      .sort(
        (left, right) => right.unlockedAt.getTime() - left.unlockedAt.getTime(),
      )
      .slice(0, RECENT_LIMIT)
      .map(({ unlockedAt, ...recent }) => ({
        ...recent,
        when: this.when(unlockedAt, now, t),
      }));
  }

  next(achievements: Achievement[]): Achievement | null {
    const pending = achievements.filter(
      (achievement) => null !== achievement.nextTier,
    );

    if (0 === pending.length) {
      return null;
    }

    return [...pending].sort(
      (left, right) =>
        right.progress - left.progress ||
        (left.remaining ?? 0) - (right.remaining ?? 0),
    )[0];
  }

  private caption(achievement: Achievement, t: Translate): string {
    const progress = {
      value: achievement.progressValue,
      target: achievement.nextThreshold,
    };

    if (null === achievement.currentTier) {
      return t("achievements.card.progress", progress);
    }

    const tier = this.tierLabel(achievement.currentTier, t);

    if (null === achievement.nextTier) {
      return t("achievements.card.completed", { tier });
    }

    return t("achievements.card.tierProgress", { tier, ...progress });
  }

  private when(unlockedAt: Date, now: Date, t: Translate): string {
    const days = Math.floor(
      (this.startOfDay(now) - this.startOfDay(unlockedAt)) / DAY_MS,
    );

    if (days <= 0) {
      return t("achievements.recent.today");
    }

    if (1 === days) {
      return t("achievements.recent.yesterday");
    }

    return t("achievements.recent.daysAgo", { count: days });
  }

  private startOfDay(date: Date): number {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
  }
}
