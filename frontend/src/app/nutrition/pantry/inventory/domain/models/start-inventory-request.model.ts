import { InventoryShift } from "./inventory-shift.model";

export interface StartInventoryRequest {
  countedOn: string;
  shift: InventoryShift;
  note: string;
}
