import { InventoryAttributes } from "./inventory-attributes.model";
import { InventoryLocation } from "./inventory-location.model";

export interface InventoryDetailAttributes extends InventoryAttributes {
  locations: InventoryLocation[];
}
