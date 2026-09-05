import { InventoryShift } from "./inventory-shift.model";
import { InventoryStatus } from "./inventory-status.model";

export interface InventoryAttributes {
  countedOn: string;
  shift: InventoryShift;
  status: InventoryStatus;
  note: string;
  totalLocations: number;
  totalItems: number;
  countedItems: number;
  adjustedItems: number;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
}
