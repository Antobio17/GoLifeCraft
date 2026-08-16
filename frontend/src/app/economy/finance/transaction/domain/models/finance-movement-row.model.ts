import { TransactionRowTag } from "@shared/design-system/transaction-row/domain/models/transaction-row-tag.model";
import { FinanceTransactionView } from "./finance-transaction-view.model";

export interface FinanceMovementRow {
  transaction: FinanceTransactionView;
  emoji: string;
  title: string;
  subtitle: string;
  amountLabel: string;
  income: boolean;
  tags: TransactionRowTag[];
}
