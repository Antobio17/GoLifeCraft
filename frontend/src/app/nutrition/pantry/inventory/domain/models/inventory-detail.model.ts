import { InventoryDetailAttributes } from "./inventory-detail-attributes.model";

export interface InventoryDetail {
  id: string;
  type: string;
  attributes: InventoryDetailAttributes;
}
