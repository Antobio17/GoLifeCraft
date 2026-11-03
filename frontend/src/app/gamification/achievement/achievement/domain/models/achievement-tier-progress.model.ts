import { AchievementTier } from "./achievement-tier.enum";

export interface AchievementTierProgress {
  tier: AchievementTier;
  threshold: number;
  unlocked: boolean;
  unlockedAt: string | null;
  seen: boolean;
}
