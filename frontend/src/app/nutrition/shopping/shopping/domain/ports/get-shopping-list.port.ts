import { Observable } from "rxjs";
import { GetShoppingListResponse } from "../models/get-shopping-list-response.model";

export abstract class GetShoppingListPort {
  abstract getShoppingList(): Observable<GetShoppingListResponse>;
}
