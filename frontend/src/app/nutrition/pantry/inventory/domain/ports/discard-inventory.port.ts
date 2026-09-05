import { Observable } from "rxjs";

export abstract class DiscardInventoryPort {
  abstract discardInventory(inventoryId: string): Observable<void>;
}
