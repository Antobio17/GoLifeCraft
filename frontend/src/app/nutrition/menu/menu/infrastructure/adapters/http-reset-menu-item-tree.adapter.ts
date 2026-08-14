import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ResetMenuItemTreePort } from "@nutrition/menu/menu/domain/ports/reset-menu-item-tree.port";

@Injectable()
export class HttpResetMenuItemTreeAdapter extends ResetMenuItemTreePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  resetMenuItemTree(menuId: string, menuItemId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${menuId}/items/${menuItemId}/tree/reset`,
      {},
    );
  }
}
