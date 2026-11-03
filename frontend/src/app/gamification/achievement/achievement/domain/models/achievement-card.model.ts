import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { AchievementTier } from "./achievement-tier.enum";

export interface AchievementCard {
  key: string;
  icon: DsIconName;
  tier: AchievementTier | null;
  name: string;
  caption: string;
  progress: number | null;
}
