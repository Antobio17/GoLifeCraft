import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateMenuItemNodePort } from "@nutrition/menu/menu/domain/ports/update-menu-item-node.port";

@Injectable()
export class HttpUpdateMenuItemNodeAdapter extends UpdateMenuItemNodePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  updateMenuItemNode(
    menuId: string,
    menuItemId: string,
    path: string,
    quantity: number,
    unit?: string,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${menuId}/items/${menuItemId}/nodes/${path}`,
      { quantity, unit: unit ?? null },
    );
  }
}
