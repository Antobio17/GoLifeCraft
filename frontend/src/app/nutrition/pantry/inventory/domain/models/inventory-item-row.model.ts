import { InventoryLocationItem } from "./inventory-location-item.model";

export interface InventoryItemRow {
  item: InventoryLocationItem;
  title: string;
  expectedLabel: string;
  differenceLabel: string;
  differenceTone: "up" | "down" | "even";
  counted: boolean;
}
