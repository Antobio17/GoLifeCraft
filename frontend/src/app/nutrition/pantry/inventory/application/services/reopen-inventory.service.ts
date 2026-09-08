import { Observable } from "rxjs";
import { ReopenInventoryPort } from "../../domain/ports/reopen-inventory.port";

export class ReopenInventoryService {
  constructor(private reopenInventoryPort: ReopenInventoryPort) {}

  reopenInventory(inventoryId: string): Observable<void> {
    return this.reopenInventoryPort.reopenInventory(inventoryId);
  }
}
