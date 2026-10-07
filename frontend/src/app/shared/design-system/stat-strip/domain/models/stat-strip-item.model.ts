import { BarTone } from "@shared/design-system/bar/domain/models/bar-tone.enum";

export interface StatStripItem {
  value: string;
  unit?: string;
  label: string;
  tone?: `${BarTone}`;
  percent?: number;
  overPercent?: number;
}
