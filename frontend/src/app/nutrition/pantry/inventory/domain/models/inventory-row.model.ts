import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";

export interface InventoryRow {
  id: string;
  weekday: string;
  day: string;
  title: string;
  meta: string;
  tag: string;
  tagTone: DatedRowTone;
  progress: number;
  ariaLabel: string;
}
