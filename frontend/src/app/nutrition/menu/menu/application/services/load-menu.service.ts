import { Observable } from "rxjs";
import { LoadMenuPort } from "../../domain/ports/load-menu.port";
import { LoadMenuRequest } from "../../domain/models/write-menu.model";

export class LoadMenuService {
  constructor(private loadMenuPort: LoadMenuPort) {}

  loadMenu(menuId: string, request: LoadMenuRequest): Observable<void> {
    return this.loadMenuPort.loadMenu(menuId, request);
  }
}
