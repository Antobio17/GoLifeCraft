import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { AchievementMetric } from "./achievement-metric.enum";
import { AchievementModule } from "./achievement-module.enum";
import { AchievementTier } from "./achievement-tier.enum";
import { AchievementTierProgress } from "./achievement-tier-progress.model";

export interface Achievement {
  key: string;
  module: AchievementModule;
  icon: DsIconName;
  metric: AchievementMetric;
  value: number;
  progressValue: number;
  activeStreak: number;
  tiers: AchievementTierProgress[];
  currentTier: AchievementTier | null;
  nextTier: AchievementTier | null;
  nextThreshold: number | null;
  remaining: number | null;
  progress: number;
  unseenTiers: AchievementTier[];
  lastUnlockedAt: string | null;
}
