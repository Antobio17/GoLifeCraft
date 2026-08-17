import { FinanceAccountsAttributes } from "./finance-accounts-attributes.model";

export interface FinanceAccounts {
  id: string;
  type: string;
  attributes: FinanceAccountsAttributes;
}
