import { FinanceAccountBalance } from "./finance-account-balance.model";
import { FinanceCategoryTotal } from "./finance-category-total.model";
import { FinanceMonthPoint } from "./finance-month-point.model";
import { FinanceStoreTotal } from "./finance-store-total.model";

export interface FinanceOverviewAttributes {
  month: string;
  balance: number;
  accounts: FinanceAccountBalance[];
  balanceDelta: number;
  balanceDeltaPercentage: number;
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
  series: FinanceMonthPoint[];
  byCategory: FinanceCategoryTotal[];
  byStore: FinanceStoreTotal[];
  expenseDeltaPercentage: number | null;
  overspending: boolean;
  averageExpense: number;
  overspendingPercentage: number;
}
