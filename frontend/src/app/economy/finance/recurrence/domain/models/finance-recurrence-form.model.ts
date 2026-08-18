import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceTransactionKind } from "@economy/finance/transaction/domain/models/finance-transaction-kind.model";

export interface FinanceRecurrenceForm {
  id: string | null;
  accountId: string;
  kind: FinanceTransactionKind;
  amount: string;
  category: FinanceCategory;
  note: string;
  store: string;
  dayOfMonth: number;
  startMonth: string;
  endMonth: string;
  active: boolean;
}
