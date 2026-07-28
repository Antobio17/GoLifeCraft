import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DuplicateMenuPort } from "@nutrition/menu/menu/domain/ports/duplicate-menu.port";
import { DuplicateMenuRequest } from "@nutrition/menu/menu/domain/models/write-menu.model";

@Injectable()
export class HttpDuplicateMenuAdapter extends DuplicateMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  duplicateMenu(
    menuId: string,
    request: DuplicateMenuRequest,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${menuId}/duplicate`, request);
  }
}
