import { Observable } from "rxjs";
import { UpdateMenuRequest } from "../models/write-menu.model";

export abstract class UpdateMenuPort {
  abstract updateMenu(
    menuId: string,
    request: UpdateMenuRequest,
  ): Observable<void>;
}
