import { BudgetMeterTone } from "@shared/design-system/budget-meter/infrastructure/components/budget-meter.component";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";

export interface FinanceBudgetCategoryRow {
  key: FinanceCategory;
  name: string;
  glyph: DsGlyph;
  color: string;
  spentLabel: string;
  budgetLabel: string;
  statusText: string;
  remainLabel: string;
  ratio: number;
  paceRatio: number;
  tone: BudgetMeterTone;
}
