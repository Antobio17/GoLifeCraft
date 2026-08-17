import { FinanceBalanceCheck } from "./finance-balance-check.model";

export interface FinanceBalanceCheckRow {
  check: FinanceBalanceCheck;
  dateLabel: string;
  amountLabel: string;
  driftLabel: string;
  driftPositive: boolean;
  hasDrift: boolean;
}
