import { Observable } from "rxjs";
import { DiscardInventoryPort } from "../../domain/ports/discard-inventory.port";

export class DiscardInventoryService {
  constructor(private discardInventoryPort: DiscardInventoryPort) {}

  discardInventory(inventoryId: string): Observable<void> {
    return this.discardInventoryPort.discardInventory(inventoryId);
  }
}
