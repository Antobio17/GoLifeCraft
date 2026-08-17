import { FinanceCategory } from "./finance-category.model";
import { FinanceTransactionKind } from "./finance-transaction-kind.model";

export interface FinanceTransactionForm {
  id: string | null;
  accountId: string;
  kind: FinanceTransactionKind;
  amount: string;
  category: FinanceCategory;
  note: string;
  store: string;
  transactionDate: string;
  recurring: boolean;
}
