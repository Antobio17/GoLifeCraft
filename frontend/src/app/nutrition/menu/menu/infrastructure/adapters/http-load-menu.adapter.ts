import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LoadMenuPort } from "@nutrition/menu/menu/domain/ports/load-menu.port";
import { LoadMenuRequest } from "@nutrition/menu/menu/domain/models/write-menu.model";

@Injectable()
export class HttpLoadMenuAdapter extends LoadMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  loadMenu(menuId: string, request: LoadMenuRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${menuId}/load`, request);
  }
}
