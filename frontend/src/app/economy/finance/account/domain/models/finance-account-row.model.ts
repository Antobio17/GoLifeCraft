import { FinanceAccount } from "./finance-account.model";
import { FinanceBalanceCheckRow } from "@economy/finance/balance-check/domain/models/finance-balance-check-row.model";

export interface FinanceAccountRow {
  account: FinanceAccount;
  emoji: string;
  typeLabel: string;
  balanceLabel: string;
  lastCheckLabel: string;
  checks: FinanceBalanceCheckRow[];
}
