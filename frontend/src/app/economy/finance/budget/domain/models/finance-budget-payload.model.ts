import { FinanceBudgetCategoryPayload } from "./finance-budget-category-payload.model";

export interface FinanceBudgetPayload {
  referenceIncome: number;
  savingsPercentage: number;
  categories: FinanceBudgetCategoryPayload[];
}
