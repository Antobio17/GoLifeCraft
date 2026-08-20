import { FinanceBudgetCategoryForm } from "./finance-budget-category-form.model";

export interface FinanceBudgetForm {
  referenceIncome: string;
  savingsPercentage: number;
  categories: FinanceBudgetCategoryForm[];
}
