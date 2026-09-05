import { Observable } from "rxjs";
import { ValidateInventoryPort } from "../../domain/ports/validate-inventory.port";

export class ValidateInventoryService {
  constructor(private validateInventoryPort: ValidateInventoryPort) {}

  validateInventory(inventoryId: string): Observable<void> {
    return this.validateInventoryPort.validateInventory(inventoryId);
  }
}
