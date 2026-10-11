import { FinanceBudgetCategoryKind } from "./finance-budget-category-kind.model";

export interface FinanceBudgetCategorySheet {
  name: string;
  kind: FinanceBudgetCategoryKind;
  variable: boolean;
  amount: number;
  amountText: string;
  sliderMax: number;
  caption: string;
  freeLabel: string;
  over: boolean;
}
