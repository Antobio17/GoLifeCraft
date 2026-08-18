import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceTransactionKind } from "@economy/finance/transaction/domain/models/finance-transaction-kind.model";

export interface FinanceRecurrence {
  id: string;
  accountId: string;
  accountName: string;
  kind: FinanceTransactionKind;
  amount: number;
  category: FinanceCategory;
  note: string;
  store: string | null;
  dayOfMonth: number;
  startMonth: string;
  endMonth: string | null;
  active: boolean;
  lastRunMonth: string | null;
  nextChargeDate: string | null;
}
