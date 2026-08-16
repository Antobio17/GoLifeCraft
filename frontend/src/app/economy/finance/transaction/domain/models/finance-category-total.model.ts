import { FinanceCategory } from "./finance-category.model";

export interface FinanceCategoryTotal {
  category: FinanceCategory;
  amount: number;
  percentage: number;
}
