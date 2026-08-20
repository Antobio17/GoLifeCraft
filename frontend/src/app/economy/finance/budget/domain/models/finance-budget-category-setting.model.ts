import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceBudgetCategoryKind } from "./finance-budget-category-kind.model";

export interface FinanceBudgetCategorySetting {
  category: FinanceCategory;
  kind: FinanceBudgetCategoryKind;
  amount: number;
  percentage: number;
}
