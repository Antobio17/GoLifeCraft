import { Observable } from "rxjs";
import { AddShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/add-shopping-list-item.port";

export class AddShoppingListItemService {
  constructor(private addShoppingListItemPort: AddShoppingListItemPort) {}

  addShoppingListItem(
    articleId: string,
    quantity = 1,
    baseQuantity: number | null = null,
  ): Observable<void> {
    return this.addShoppingListItemPort.addShoppingListItem({
      articleId,
      customName: null,
      quantity,
      baseQuantity,
    });
  }

  addCustomShoppingListItem(
    customName: string,
    quantity = 1,
  ): Observable<void> {
    return this.addShoppingListItemPort.addShoppingListItem({
      articleId: null,
      customName,
      quantity,
      baseQuantity: null,
    });
  }
}
