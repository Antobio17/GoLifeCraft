import { FinanceBudgetSettingsAttributes } from "./finance-budget-settings-attributes.model";

export interface FinanceBudgetSettings {
  id: string;
  type: string;
  attributes: FinanceBudgetSettingsAttributes;
}
