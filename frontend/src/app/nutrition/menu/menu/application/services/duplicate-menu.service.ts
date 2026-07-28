import { Observable } from "rxjs";
import { DuplicateMenuPort } from "../../domain/ports/duplicate-menu.port";
import { DuplicateMenuRequest } from "../../domain/models/write-menu.model";

export class DuplicateMenuService {
  constructor(private duplicateMenuPort: DuplicateMenuPort) {}

  duplicateMenu(
    menuId: string,
    request: DuplicateMenuRequest,
  ): Observable<void> {
    return this.duplicateMenuPort.duplicateMenu(menuId, request);
  }
}
