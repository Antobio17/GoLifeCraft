import { Observable } from "rxjs";
import { SaveMenuItemPort } from "../../domain/ports/save-menu-item.port";
import { AddMenuItemRequest } from "../../domain/models/add-menu-item-request.model";
import { UpdateMenuItemRequest } from "../../domain/models/update-menu-item-request.model";

export class SaveMenuItemService {
  constructor(private saveMenuItemPort: SaveMenuItemPort) {}

  addMenuItem(
    menuId: string,
    menuItemId: string,
    request: AddMenuItemRequest,
  ): Observable<void> {
    return this.saveMenuItemPort.addMenuItem(menuId, menuItemId, request);
  }

  updateMenuItem(
    menuId: string,
    menuItemId: string,
    request: UpdateMenuItemRequest,
  ): Observable<void> {
    return this.saveMenuItemPort.updateMenuItem(menuId, menuItemId, request);
  }

  removeMenuItem(menuId: string, menuItemId: string): Observable<void> {
    return this.saveMenuItemPort.removeMenuItem(menuId, menuItemId);
  }
}
