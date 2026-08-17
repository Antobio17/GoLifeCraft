import { FinanceAccountType } from "./finance-account-type.model";

export interface FinanceAccount {
  id: string;
  name: string;
  type: FinanceAccountType;
  balance: number;
  lastCheckDate: string | null;
  lastCheckAmount: number | null;
  transactionCount: number;
}
