import { Observable } from "rxjs";

export abstract class ResetMenuItemTreePort {
  abstract resetMenuItemTree(
    menuId: string,
    menuItemId: string,
  ): Observable<void>;
}
