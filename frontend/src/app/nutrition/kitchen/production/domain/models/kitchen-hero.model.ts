import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";
import { WeekStripDay } from "@shared/design-system/week-strip/domain/models/week-strip-day.model";
import { KitchenHeroRow } from "./kitchen-hero-row.model";

export interface KitchenHero {
  title: string;
  stats: StatStripItem[];
  rows: KitchenHeroRow[];
  more: string;
  week: WeekStripDay[];
  weekTitle: string;
  weekCaption: string;
}
