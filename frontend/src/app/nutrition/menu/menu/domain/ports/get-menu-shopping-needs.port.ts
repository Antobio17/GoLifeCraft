import { Observable } from "rxjs";
import { GetMenuShoppingNeedsResponse } from "../models/menu-shopping-needs.model";

export abstract class GetMenuShoppingNeedsPort {
  abstract getMenuShoppingNeeds(
    menuId: string,
  ): Observable<GetMenuShoppingNeedsResponse>;
}
