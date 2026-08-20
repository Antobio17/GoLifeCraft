import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceBudgetCategoryKind } from "./finance-budget-category-kind.model";

export interface FinanceBudgetSettingsRow {
  key: FinanceCategory;
  index: number;
  name: string;
  emoji: string;
  kind: FinanceBudgetCategoryKind;
  variable: boolean;
  amount: number;
  amountText: string;
  amountLabel: string;
  percentageLabel: string;
  sliderMax: number;
}
