import { FinanceAccountType } from "@economy/finance/account/domain/models/finance-account-type.model";

export interface FinanceAccountBalance {
  accountId: string;
  name: string;
  type: FinanceAccountType;
  balance: number;
  lastCheckDate: string | null;
}
