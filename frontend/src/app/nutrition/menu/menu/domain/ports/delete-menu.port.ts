import { Observable } from "rxjs";

export abstract class DeleteMenuPort {
  abstract deleteMenu(menuId: string): Observable<void>;
}
