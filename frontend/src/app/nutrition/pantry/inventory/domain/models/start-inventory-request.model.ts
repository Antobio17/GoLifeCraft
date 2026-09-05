import { InventoryShift } from "./inventory-shift.model";

export interface StartInventoryRequest {
  countedOn: string;
  shift: InventoryShift;
  locationId: string | null;
  note: string;
}
