import { InventoryShift } from "./inventory-shift.model";

export interface RescheduleInventoryRequest {
  countedOn: string;
  shift: InventoryShift;
}
