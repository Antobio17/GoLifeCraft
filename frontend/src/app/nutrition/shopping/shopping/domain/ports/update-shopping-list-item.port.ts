import { Observable } from "rxjs";
import { UpdateShoppingListItemRequest } from "../models/update-shopping-list-item.model";

export abstract class UpdateShoppingListItemPort {
  abstract updateShoppingListItem(
    itemId: string,
    request: UpdateShoppingListItemRequest,
  ): Observable<void>;
}
