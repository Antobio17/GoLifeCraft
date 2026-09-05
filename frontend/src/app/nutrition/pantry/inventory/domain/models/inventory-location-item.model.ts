import { InventoryItemKind } from "./inventory-item-kind.model";

export interface InventoryLocationItem {
  id: string;
  position: number;
  kind: InventoryItemKind;
  refId: string;
  name: string;
  emoji: string;
  unit: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  difference: number;
}
