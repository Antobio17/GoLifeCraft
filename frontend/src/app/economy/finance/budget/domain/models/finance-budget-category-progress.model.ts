import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceBudgetCategoryKind } from "./finance-budget-category-kind.model";
import { FinanceBudgetStatus } from "./finance-budget-status.model";

export interface FinanceBudgetCategoryProgress {
  category: FinanceCategory;
  kind: FinanceBudgetCategoryKind;
  budget: number;
  spent: number;
  expected: number;
  difference: number;
  remaining: number;
  progress: number;
  status: FinanceBudgetStatus;
}
