import { Observable } from "rxjs";
import { ApplyWeekMenuPort } from "../../domain/ports/apply-week-menu.port";
import { ApplyWeekMenuRequest } from "../../domain/models/write-menu.model";

export class ApplyWeekMenuService {
  constructor(private applyWeekMenuPort: ApplyWeekMenuPort) {}

  applyWeekMenu(
    menuId: string,
    request: ApplyWeekMenuRequest,
  ): Observable<void> {
    return this.applyWeekMenuPort.applyWeekMenu(menuId, request);
  }
}
