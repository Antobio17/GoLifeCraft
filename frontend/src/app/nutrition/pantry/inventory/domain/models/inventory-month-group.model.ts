import { InventoryRow } from "./inventory-row.model";

export interface InventoryMonthGroup {
  key: string;
  title: string;
  countLabel: string;
  rows: InventoryRow[];
}
