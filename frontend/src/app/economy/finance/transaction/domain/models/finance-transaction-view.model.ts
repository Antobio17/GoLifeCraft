import { FinanceCategory } from "./finance-category.model";
import { FinanceTransactionKind } from "./finance-transaction-kind.model";
import { FinanceTransactionSource } from "./finance-transaction-source.model";

export interface FinanceTransactionView {
  id: string;
  transactionDate: string;
  kind: FinanceTransactionKind;
  amount: number;
  category: FinanceCategory;
  note: string;
  store: string | null;
  recurring: boolean;
  source: FinanceTransactionSource;
}
