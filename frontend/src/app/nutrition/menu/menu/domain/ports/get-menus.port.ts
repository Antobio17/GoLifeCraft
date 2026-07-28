import { Observable } from "rxjs";
import { GetMenusResponse } from "../models/get-menus-response.model";

export abstract class GetMenusPort {
  abstract getMenus(
    page?: number,
    pageSize?: number,
    filterName?: string,
    orderBy?: string,
  ): Observable<GetMenusResponse>;
}
