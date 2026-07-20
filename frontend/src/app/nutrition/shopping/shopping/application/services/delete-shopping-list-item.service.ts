import { Observable } from "rxjs";
import { DeleteShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/delete-shopping-list-item.port";

export class DeleteShoppingListItemService {
  constructor(private deleteShoppingListItemPort: DeleteShoppingListItemPort) {}

  deleteShoppingListItem(itemId: string): Observable<void> {
    return this.deleteShoppingListItemPort.deleteShoppingListItem(itemId);
  }
}
