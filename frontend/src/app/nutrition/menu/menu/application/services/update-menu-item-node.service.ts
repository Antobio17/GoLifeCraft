import { Observable } from "rxjs";
import { UpdateMenuItemNodePort } from "../../domain/ports/update-menu-item-node.port";

export class UpdateMenuItemNodeService {
  constructor(private updateMenuItemNodePort: UpdateMenuItemNodePort) {}

  updateMenuItemNode(
    menuId: string,
    menuItemId: string,
    path: string,
    quantity: number,
    unit?: string,
  ): Observable<void> {
    return this.updateMenuItemNodePort.updateMenuItemNode(
      menuId,
      menuItemId,
      path,
      quantity,
      unit,
    );
  }
}
