import { FinanceAccountType } from "./finance-account-type.model";

export interface FinanceAccountPayload {
  name: string;
  type: FinanceAccountType;
}
