import { FinanceCategory } from "./finance-category.model";

export interface FinanceSubscription {
  note: string;
  amount: number;
  category: FinanceCategory;
  chargeDay: number;
}
