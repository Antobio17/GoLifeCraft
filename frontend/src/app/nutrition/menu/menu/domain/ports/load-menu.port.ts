import { Observable } from "rxjs";
import { LoadMenuRequest } from "../models/write-menu.model";

export abstract class LoadMenuPort {
  abstract loadMenu(menuId: string, request: LoadMenuRequest): Observable<void>;
}
