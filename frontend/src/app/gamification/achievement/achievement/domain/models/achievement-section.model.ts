import { AchievementCard } from "./achievement-card.model";
import { AchievementModule } from "./achievement-module.enum";

export interface AchievementSection {
  module: AchievementModule;
  title: string;
  count: string;
  cards: AchievementCard[];
}
