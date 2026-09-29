import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { FinanceRecurrence } from "./finance-recurrence.model";

export interface FinanceRecurrenceRow {
  recurrence: FinanceRecurrence;
  glyph: DsGlyph;
  glyphColor: string;
  amountLabel: string;
  scheduleLabel: string;
  nextChargeLabel: string;
  paused: boolean;
  actionIcon: DsIconName;
  actionLabel: string;
}
