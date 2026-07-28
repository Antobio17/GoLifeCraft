import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetMenuPort } from "@nutrition/menu/menu/domain/ports/get-menu.port";
import { GetMenuResponse } from "@nutrition/menu/menu/domain/models/get-menu-response.model";

@Injectable()
export class HttpGetMenuAdapter extends GetMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  getMenu(menuId: string): Observable<GetMenuResponse> {
    return this.http.get<GetMenuResponse>(`${this.apiUrl}/${menuId}`);
  }
}
