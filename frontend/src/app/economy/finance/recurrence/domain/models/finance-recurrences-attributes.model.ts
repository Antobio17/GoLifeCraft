import { FinanceRecurrence } from "./finance-recurrence.model";

export interface FinanceRecurrencesAttributes {
  accountId: string | null;
  recurrences: FinanceRecurrence[];
  monthlyIncome: number;
  monthlyExpense: number;
}
