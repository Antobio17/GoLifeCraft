import { InventoryLocation } from "./inventory-location.model";
import { InventoryItemRow } from "./inventory-item-row.model";

export interface InventoryLocationGroup {
  location: InventoryLocation;
  title: string;
  progressLabel: string;
  gone: boolean;
  rows: InventoryItemRow[];
}
