import { FinanceAccountType } from "./finance-account-type.model";

export interface CreateFinanceAccountPayload {
  name: string;
  type: FinanceAccountType;
  balance: number | null;
  balanceDate: string;
}
