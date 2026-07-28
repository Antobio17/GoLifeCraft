import { Observable } from "rxjs";
import { DuplicateMenuRequest } from "../models/write-menu.model";

export abstract class DuplicateMenuPort {
  abstract duplicateMenu(
    menuId: string,
    request: DuplicateMenuRequest,
  ): Observable<void>;
}
