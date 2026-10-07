import { ChipTone } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { StackedBarSegment } from "@shared/design-system/stacked-bar/domain/models/stacked-bar-segment.model";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";

export interface DiarySummaryCard {
  statusKey: string;
  statusTone: ChipTone;
  headlineKey: string;
  kcal: string;
  over: boolean;
  caption: { consumed: string; goal: string; percent: string };
  segments: StackedBarSegment[];
  marker: number | null;
  stats: StatStripItem[];
}
