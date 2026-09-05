import { Observable } from "rxjs";
import { CountInventoryItemPort } from "../../domain/ports/count-inventory-item.port";
import { CountInventoryItemRequest } from "../../domain/models/count-inventory-item-request.model";

export class CountInventoryItemService {
  constructor(private countInventoryItemPort: CountInventoryItemPort) {}

  countInventoryItem(
    inventoryId: string,
    itemId: string,
    request: CountInventoryItemRequest,
  ): Observable<void> {
    return this.countInventoryItemPort.countInventoryItem(
      inventoryId,
      itemId,
      request,
    );
  }
}
