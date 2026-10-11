import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";

export interface FinanceBudgetSettingsRow {
  key: FinanceCategory;
  index: number;
  name: string;
  glyph: DsGlyph;
  color: string;
  amountLabel: string;
  editLabel: string;
}
