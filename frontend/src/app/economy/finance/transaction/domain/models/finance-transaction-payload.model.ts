import { FinanceCategory } from "./finance-category.model";
import { FinanceTransactionKind } from "./finance-transaction-kind.model";

export interface FinanceTransactionPayload {
  transactionDate: string;
  kind: FinanceTransactionKind;
  amount: number;
  category: FinanceCategory;
  note: string;
  store: string | null;
  recurring: boolean;
}
