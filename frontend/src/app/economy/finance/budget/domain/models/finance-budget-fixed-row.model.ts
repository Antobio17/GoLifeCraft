import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";

export interface FinanceBudgetFixedRow {
  key: FinanceCategory;
  name: string;
  glyph: DsGlyph;
  color: string;
  note: string;
  amountLabel: string;
}
