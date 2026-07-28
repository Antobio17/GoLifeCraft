import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateMenuPort } from "@nutrition/menu/menu/domain/ports/update-menu.port";
import { UpdateMenuRequest } from "@nutrition/menu/menu/domain/models/write-menu.model";

@Injectable()
export class HttpUpdateMenuAdapter extends UpdateMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  updateMenu(menuId: string, request: UpdateMenuRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${menuId}`, request);
  }
}
