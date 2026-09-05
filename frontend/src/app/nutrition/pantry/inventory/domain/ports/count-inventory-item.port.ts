import { Observable } from "rxjs";
import { CountInventoryItemRequest } from "../models/count-inventory-item-request.model";

export abstract class CountInventoryItemPort {
  abstract countInventoryItem(
    inventoryId: string,
    itemId: string,
    request: CountInventoryItemRequest,
  ): Observable<void>;
}
