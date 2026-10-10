import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";

export interface TicketRow {
  id: string;
  weekday: string;
  day: string;
  title: string;
  meta: string;
  value: string;
  tag: string;
  tagTone: DatedRowTone;
  progress: number;
  ariaLabel: string;
}
