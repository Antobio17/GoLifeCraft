import { InventoryLineKind } from "./inventory-line-kind.model";

export interface InventoryLine {
  id: string;
  position: number;
  kind: InventoryLineKind;
  refId: string;
  locationId: string | null;
  locationName: string | null;
  name: string;
  emoji: string;
  unit: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  difference: number;
}
