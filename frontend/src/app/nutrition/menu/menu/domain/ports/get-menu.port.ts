import { Observable } from "rxjs";
import { GetMenuResponse } from "../models/get-menu-response.model";

export abstract class GetMenuPort {
  abstract getMenu(menuId: string): Observable<GetMenuResponse>;
}
