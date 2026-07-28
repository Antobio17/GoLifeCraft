import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApplyWeekMenuPort } from "@nutrition/menu/menu/domain/ports/apply-week-menu.port";
import { ApplyWeekMenuRequest } from "@nutrition/menu/menu/domain/models/write-menu.model";

@Injectable()
export class HttpApplyWeekMenuAdapter extends ApplyWeekMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  applyWeekMenu(
    menuId: string,
    request: ApplyWeekMenuRequest,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${menuId}/apply-week`, request);
  }
}
