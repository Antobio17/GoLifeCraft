import { FinanceBudgetAttributes } from "./finance-budget-attributes.model";

export interface FinanceBudget {
  id: string;
  type: string;
  attributes: FinanceBudgetAttributes;
}
