import { FinanceBalanceCheck } from "./finance-balance-check.model";

export interface FinanceBalanceChecksAttributes {
  accountId: string | null;
  checks: FinanceBalanceCheck[];
}
