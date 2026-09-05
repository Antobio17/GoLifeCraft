import { InventoryShift } from "./inventory-shift.model";
import { InventoryStatus } from "./inventory-status.model";

export interface InventoryAttributes {
  countedOn: string;
  shift: InventoryShift;
  status: InventoryStatus;
  locationId: string | null;
  locationName: string | null;
  note: string;
  totalLines: number;
  countedLines: number;
  adjustedLines: number;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
}
