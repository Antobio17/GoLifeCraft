import { Observable } from "rxjs";
import { AddShoppingListItemRequest } from "../models/add-shopping-list-item.model";

export abstract class AddShoppingListItemPort {
  abstract addShoppingListItem(
    request: AddShoppingListItemRequest,
  ): Observable<void>;
}
