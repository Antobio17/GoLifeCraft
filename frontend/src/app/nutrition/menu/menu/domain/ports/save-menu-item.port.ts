import { Observable } from "rxjs";
import { AddMenuItemRequest } from "../models/add-menu-item-request.model";
import { UpdateMenuItemRequest } from "../models/update-menu-item-request.model";

export abstract class SaveMenuItemPort {
  abstract addMenuItem(
    menuId: string,
    menuItemId: string,
    request: AddMenuItemRequest,
  ): Observable<void>;

  abstract updateMenuItem(
    menuId: string,
    menuItemId: string,
    request: UpdateMenuItemRequest,
  ): Observable<void>;

  abstract removeMenuItem(menuId: string, menuItemId: string): Observable<void>;
}
