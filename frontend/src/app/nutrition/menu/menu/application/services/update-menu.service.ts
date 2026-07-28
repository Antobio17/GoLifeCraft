import { Observable } from "rxjs";
import { UpdateMenuPort } from "../../domain/ports/update-menu.port";
import { UpdateMenuRequest } from "../../domain/models/write-menu.model";

export class UpdateMenuService {
  constructor(private updateMenuPort: UpdateMenuPort) {}

  updateMenu(menuId: string, request: UpdateMenuRequest): Observable<void> {
    return this.updateMenuPort.updateMenu(menuId, request);
  }
}
