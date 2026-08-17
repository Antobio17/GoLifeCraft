import { FinanceAccount } from "./finance-account.model";

export interface FinanceAccountsAttributes {
  date: string;
  accounts: FinanceAccount[];
  balance: number;
}
