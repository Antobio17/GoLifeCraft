import { Observable } from "rxjs";
import { MenuDocument } from "../models/menu-document.model";

export abstract class ExportMenuPort {
  abstract exportMenu(
    menuId: string,
    language: string,
  ): Observable<MenuDocument>;
}
