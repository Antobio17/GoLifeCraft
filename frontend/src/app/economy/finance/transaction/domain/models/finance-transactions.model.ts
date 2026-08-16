import { FinanceTransactionsAttributes } from "./finance-transactions-attributes.model";

export interface FinanceTransactions {
  id: string;
  type: string;
  attributes: FinanceTransactionsAttributes;
}
