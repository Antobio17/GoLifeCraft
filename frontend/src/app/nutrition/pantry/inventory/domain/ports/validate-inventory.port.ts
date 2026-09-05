import { Observable } from "rxjs";

export abstract class ValidateInventoryPort {
  abstract validateInventory(inventoryId: string): Observable<void>;
}
