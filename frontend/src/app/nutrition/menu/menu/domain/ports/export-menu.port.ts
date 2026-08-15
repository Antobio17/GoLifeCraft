import { Observable } from "rxjs";
import { Theme } from "@shared/theme/domain/models/theme.model";
import { MenuDocument } from "../models/menu-document.model";

export abstract class ExportMenuPort {
  abstract exportMenu(
    menuId: string,
    language: string,
    theme: Theme,
  ): Observable<MenuDocument>;
}
