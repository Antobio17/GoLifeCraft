import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";

export interface TicketHero {
  title: string;
  caption: string;
  percent: number;
  tickets: number;
  pendingTicketId: string | null;
  stats: StatStripItem[];
}
