import { InventoryItemKind } from "./inventory-item-kind.model";
import { InventoryItemUnit } from "./inventory-item-unit.model";

export interface InventoryLocationItem {
  id: string;
  position: number;
  kind: InventoryItemKind;
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  unit: string;
  units: InventoryItemUnit[];
  expectedQuantity: number;
  countedQuantity: number | null;
  countedUnit: string | null;
  difference: number;
}
