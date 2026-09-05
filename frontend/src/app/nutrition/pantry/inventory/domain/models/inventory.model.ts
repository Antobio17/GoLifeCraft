import { InventoryAttributes } from "./inventory-attributes.model";

export interface Inventory {
  id: string;
  type: string;
  attributes: InventoryAttributes;
}
