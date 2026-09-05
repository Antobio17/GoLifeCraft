import { Observable } from "rxjs";
import { StartInventoryPort } from "../../domain/ports/start-inventory.port";
import { StartInventoryRequest } from "../../domain/models/start-inventory-request.model";

export class StartInventoryService {
  constructor(private startInventoryPort: StartInventoryPort) {}

  startInventory(request: StartInventoryRequest): Observable<void> {
    return this.startInventoryPort.startInventory(request);
  }
}
