import { InventoryLocationItem } from "./inventory-location-item.model";

export interface InventoryItemRow {
  item: InventoryLocationItem;
  emoji: string;
  name: string;
  imageUrl: string | null;
  expectedLabel: string;
  differenceLabel: string;
  differenceTone: "up" | "down" | "even";
  counted: boolean;
}
