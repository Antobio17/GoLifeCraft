import { FinanceBalanceChecksAttributes } from "./finance-balance-checks-attributes.model";

export interface FinanceBalanceChecks {
  id: string;
  type: string;
  attributes: FinanceBalanceChecksAttributes;
}
