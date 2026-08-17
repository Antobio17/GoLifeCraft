import { FinanceMovementRow } from "./finance-movement-row.model";

export interface FinanceMovementGroup {
  key: string;
  label: string;
  summaryLabel: string;
  rows: FinanceMovementRow[];
}
