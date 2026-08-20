import { FinanceBudgetCategorySetting } from "./finance-budget-category-setting.model";

export interface FinanceBudgetSettingsAttributes {
  configured: boolean;
  referenceIncome: number;
  suggestedIncome: number;
  savingsPercentage: number;
  savingsAmount: number;
  allocatedAmount: number;
  unassignedAmount: number;
  unassignedPercentage: number;
  categories: FinanceBudgetCategorySetting[];
}
