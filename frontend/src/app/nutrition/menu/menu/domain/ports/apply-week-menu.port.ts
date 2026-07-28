import { Observable } from "rxjs";
import { ApplyWeekMenuRequest } from "../models/write-menu.model";

export abstract class ApplyWeekMenuPort {
  abstract applyWeekMenu(
    menuId: string,
    request: ApplyWeekMenuRequest,
  ): Observable<void>;
}
