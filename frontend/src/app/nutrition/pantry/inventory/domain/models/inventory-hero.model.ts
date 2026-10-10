import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";

export interface InventoryHero {
  title: string;
  caption: string;
  statusLabel: string;
  validated: boolean;
  percent: number;
  stats: StatStripItem[];
}
