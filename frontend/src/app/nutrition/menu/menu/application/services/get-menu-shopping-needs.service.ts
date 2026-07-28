import { Observable } from "rxjs";
import { GetMenuShoppingNeedsPort } from "../../domain/ports/get-menu-shopping-needs.port";
import { GetMenuShoppingNeedsResponse } from "../../domain/models/menu-shopping-needs.model";

export class GetMenuShoppingNeedsService {
  constructor(private getMenuShoppingNeedsPort: GetMenuShoppingNeedsPort) {}

  getMenuShoppingNeeds(
    menuId: string,
  ): Observable<GetMenuShoppingNeedsResponse> {
    return this.getMenuShoppingNeedsPort.getMenuShoppingNeeds(menuId);
  }
}
