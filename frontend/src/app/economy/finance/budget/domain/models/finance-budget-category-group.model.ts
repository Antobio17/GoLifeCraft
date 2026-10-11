import { FinanceBudgetCategoryGroupKey } from "./finance-budget-category-group-key.model";
import { FinanceBudgetCategoryRow } from "./finance-budget-category-row.model";

export interface FinanceBudgetCategoryGroup {
  key: FinanceBudgetCategoryGroupKey;
  title: string;
  countLabel: string;
  rows: FinanceBudgetCategoryRow[];
}
