import { Observable } from "rxjs";
import { RescheduleInventoryPort } from "../../domain/ports/reschedule-inventory.port";
import { RescheduleInventoryRequest } from "../../domain/models/reschedule-inventory-request.model";

export class RescheduleInventoryService {
  constructor(private rescheduleInventoryPort: RescheduleInventoryPort) {}

  rescheduleInventory(
    inventoryId: string,
    request: RescheduleInventoryRequest,
  ): Observable<void> {
    return this.rescheduleInventoryPort.rescheduleInventory(
      inventoryId,
      request,
    );
  }
}
