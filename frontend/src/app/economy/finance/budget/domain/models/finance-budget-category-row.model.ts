import { BudgetMeterTone } from "@shared/design-system/budget-meter/infrastructure/components/budget-meter.component";
import { ChipTone } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";

export interface FinanceBudgetCategoryRow {
  key: FinanceCategory;
  name: string;
  glyph: DsGlyph;
  color: string;
  metaLabel: string;
  amountLabel: string;
  chipLabel: string;
  chipTone: ChipTone;
  budgetLabel: string;
  ratio: number | null;
  paceRatio: number;
  tone: BudgetMeterTone;
}
