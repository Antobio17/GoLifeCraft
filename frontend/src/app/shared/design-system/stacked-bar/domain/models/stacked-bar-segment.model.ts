import { BarTone } from "@shared/design-system/bar/domain/models/bar-tone.enum";

export interface StackedBarSegment {
  value: number;
  tone: `${BarTone}`;
  label: string;
}
