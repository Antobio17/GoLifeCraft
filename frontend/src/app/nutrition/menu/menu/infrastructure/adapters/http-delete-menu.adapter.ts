import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteMenuPort } from "@nutrition/menu/menu/domain/ports/delete-menu.port";

@Injectable()
export class HttpDeleteMenuAdapter extends DeleteMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  deleteMenu(menuId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${menuId}`);
  }
}
