import { Observable } from "rxjs";
import { UpdateShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/update-shopping-list-item.port";

export class UpdateShoppingListItemService {
  constructor(private updateShoppingListItemPort: UpdateShoppingListItemPort) {}

  updateShoppingListItem(
    itemId: string,
    quantity: number,
    checked: boolean,
  ): Observable<void> {
    return this.updateShoppingListItemPort.updateShoppingListItem(itemId, {
      quantity,
      checked,
    });
  }
}
