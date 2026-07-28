import { Observable } from "rxjs";
import { GetMenuPort } from "../../domain/ports/get-menu.port";
import { GetMenuResponse } from "../../domain/models/get-menu-response.model";

export class GetMenuService {
  constructor(private getMenuPort: GetMenuPort) {}

  getMenu(menuId: string): Observable<GetMenuResponse> {
    return this.getMenuPort.getMenu(menuId);
  }
}
