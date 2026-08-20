import { FinanceBudgetCategoryProgress } from "./finance-budget-category-progress.model";
import { FinanceBudgetStatus } from "./finance-budget-status.model";

export interface FinanceBudgetAttributes {
  month: string;
  configured: boolean;
  dayOfMonth: number;
  daysInMonth: number;
  monthProgress: number;
  referenceIncome: number;
  savingsPercentage: number;
  savingsObjective: number;
  savingsReal: number;
  savingsProgress: number;
  savingsStatus: FinanceBudgetStatus;
  variableBudget: number;
  variableSpent: number;
  variableExpected: number;
  variableDifference: number;
  variableRemaining: number;
  variableProgress: number;
  variableStatus: FinanceBudgetStatus;
  variableCategories: FinanceBudgetCategoryProgress[];
  fixedCategories: FinanceBudgetCategoryProgress[];
}
