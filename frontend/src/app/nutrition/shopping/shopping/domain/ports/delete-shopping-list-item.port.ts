import { Observable } from "rxjs";

export abstract class DeleteShoppingListItemPort {
  abstract deleteShoppingListItem(itemId: string): Observable<void>;
}
