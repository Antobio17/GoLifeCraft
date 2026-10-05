import { Observable } from "rxjs";
import { RescheduleInventoryRequest } from "../models/reschedule-inventory-request.model";

export abstract class RescheduleInventoryPort {
  abstract rescheduleInventory(
    inventoryId: string,
    request: RescheduleInventoryRequest,
  ): Observable<void>;
}
