import { ChipTone } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";

export interface FinanceBudgetFixedRow {
  key: FinanceCategory;
  name: string;
  glyph: DsGlyph;
  color: string;
  metaLabel: string;
  amountLabel: string;
  chipLabel: string;
  chipTone: ChipTone;
  settled: boolean;
}
