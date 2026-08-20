import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";

export interface FinanceBudgetFixedRow {
  key: FinanceCategory;
  name: string;
  emoji: string;
  note: string;
  amountLabel: string;
}
