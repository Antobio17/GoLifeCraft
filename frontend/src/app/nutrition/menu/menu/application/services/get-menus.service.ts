import { Observable } from "rxjs";
import { GetMenusPort } from "../../domain/ports/get-menus.port";
import { GetMenusResponse } from "../../domain/models/get-menus-response.model";

export class GetMenusService {
  constructor(private getMenusPort: GetMenusPort) {}

  getMenus(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
    orderBy?: string,
  ): Observable<GetMenusResponse> {
    return this.getMenusPort.getMenus(page, pageSize, filterName, orderBy);
  }
}
