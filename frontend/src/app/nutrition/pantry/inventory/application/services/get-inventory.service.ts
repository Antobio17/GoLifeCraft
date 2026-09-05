import { Observable } from "rxjs";
import { GetInventoryPort } from "../../domain/ports/get-inventory.port";
import { GetInventoryResponse } from "../../domain/models/get-inventory-response.model";

export class GetInventoryService {
  constructor(private getInventoryPort: GetInventoryPort) {}

  getInventory(inventoryId: string): Observable<GetInventoryResponse> {
    return this.getInventoryPort.getInventory(inventoryId);
  }
}
