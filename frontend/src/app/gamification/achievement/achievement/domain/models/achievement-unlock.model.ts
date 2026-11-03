import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { AchievementModule } from "./achievement-module.enum";
import { AchievementTier } from "./achievement-tier.enum";
import { CelebrationKind } from "./celebration-kind.enum";

export interface AchievementUnlock {
  key: string;
  module: AchievementModule;
  icon: DsIconName;
  tier: AchievementTier;
  threshold: number;
  nextTier: AchievementTier | null;
  nextThreshold: number | null;
  kind: CelebrationKind;
}
