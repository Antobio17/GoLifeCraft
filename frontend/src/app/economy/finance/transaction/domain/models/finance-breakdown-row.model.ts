import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";

export interface FinanceBreakdownRow {
  key: string;
  label: string;
  amountLabel: string;
  percentageLabel: string;
  glyph: DsGlyph | null;
  color: string;
  ratio: number;
}
