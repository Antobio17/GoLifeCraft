import { InventoryAttributes } from "./inventory-attributes.model";
import { InventoryLine } from "./inventory-line.model";

export interface InventoryDetailAttributes extends InventoryAttributes {
  lines: InventoryLine[];
}
