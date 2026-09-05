import { InventoryLocationItem } from "./inventory-location-item.model";

export interface InventoryLocation {
  id: string;
  position: number;
  locationId: string | null;
  name: string;
  emoji: string;
  totalItems: number;
  countedItems: number;
  adjustedItems: number;
  items: InventoryLocationItem[];
}
