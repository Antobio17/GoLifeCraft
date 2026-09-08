import { Observable } from "rxjs";

export abstract class ReopenInventoryPort {
  abstract reopenInventory(inventoryId: string): Observable<void>;
}
