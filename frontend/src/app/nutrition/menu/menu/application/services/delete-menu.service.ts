import { Observable } from "rxjs";
import { DeleteMenuPort } from "../../domain/ports/delete-menu.port";

export class DeleteMenuService {
  constructor(private deleteMenuPort: DeleteMenuPort) {}

  deleteMenu(menuId: string): Observable<void> {
    return this.deleteMenuPort.deleteMenu(menuId);
  }
}
