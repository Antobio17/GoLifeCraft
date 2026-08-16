import { FinanceTransactionView } from "./finance-transaction-view.model";

export interface FinanceTransactionsAttributes {
  month: string;
  date: string | null;
  transactions: FinanceTransactionView[];
  transactionCount: number;
  income: number;
  expense: number;
}
