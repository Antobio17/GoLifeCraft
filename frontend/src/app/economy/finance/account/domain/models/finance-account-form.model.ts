import { FinanceAccountType } from "./finance-account-type.model";

export interface FinanceAccountForm {
  id: string | null;
  name: string;
  type: FinanceAccountType;
}
