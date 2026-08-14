import { Observable } from "rxjs";
import { ResetMenuItemTreePort } from "../../domain/ports/reset-menu-item-tree.port";

export class ResetMenuItemTreeService {
  constructor(private resetMenuItemTreePort: ResetMenuItemTreePort) {}

  resetMenuItemTree(menuId: string, menuItemId: string): Observable<void> {
    return this.resetMenuItemTreePort.resetMenuItemTree(menuId, menuItemId);
  }
}
