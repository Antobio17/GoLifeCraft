import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateMenuPort } from "@nutrition/menu/menu/domain/ports/create-menu.port";
import { CreateMenuRequest } from "@nutrition/menu/menu/domain/models/write-menu.model";

@Injectable()
export class HttpCreateMenuAdapter extends CreateMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  createMenu(request: CreateMenuRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
