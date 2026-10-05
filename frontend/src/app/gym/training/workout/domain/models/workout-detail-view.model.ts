import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";

export interface WorkoutDetailView {
  sessionName: string;
  statusLabel: string;
  dateLabel: string;
  timeLabel: string;
  stats: StatStripItem[];
}
