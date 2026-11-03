import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { AchievementTier } from "./achievement-tier.enum";

export interface RecentAchievement {
  key: string;
  icon: DsIconName;
  tier: AchievementTier;
  name: string;
  when: string;
}
