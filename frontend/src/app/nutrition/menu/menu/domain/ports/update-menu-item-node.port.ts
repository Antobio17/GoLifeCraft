import { Observable } from "rxjs";

export abstract class UpdateMenuItemNodePort {
  abstract updateMenuItemNode(
    menuId: string,
    menuItemId: string,
    path: string,
    quantity: number,
    unit?: string,
  ): Observable<void>;
}
