import { Observable } from "rxjs";
import { GetShoppingListPort } from "@nutrition/shopping/shopping/domain/ports/get-shopping-list.port";
import { GetShoppingListResponse } from "@nutrition/shopping/shopping/domain/models/get-shopping-list-response.model";

export class GetShoppingListService {
  constructor(private getShoppingListPort: GetShoppingListPort) {}

  getShoppingList(): Observable<GetShoppingListResponse> {
    return this.getShoppingListPort.getShoppingList();
  }
}
