import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SaveMenuItemPort } from "../../domain/ports/save-menu-item.port";
import { AddMenuItemRequest } from "../../domain/models/add-menu-item-request.model";
import { UpdateMenuItemRequest } from "../../domain/models/update-menu-item-request.model";

@Injectable()
export class HttpSaveMenuItemAdapter extends SaveMenuItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  addMenuItem(
    menuId: string,
    menuItemId: string,
    request: AddMenuItemRequest,
  ): Observable<void> {
    return this.http.put<void>(this.itemUrl(menuId, menuItemId), request);
  }

  updateMenuItem(
    menuId: string,
    menuItemId: string,
    request: UpdateMenuItemRequest,
  ): Observable<void> {
    return this.http.patch<void>(this.itemUrl(menuId, menuItemId), request);
  }

  removeMenuItem(menuId: string, menuItemId: string): Observable<void> {
    return this.http.delete<void>(this.itemUrl(menuId, menuItemId));
  }

  private itemUrl(menuId: string, menuItemId: string): string {
    return `${this.apiUrl}/${menuId}/items/${menuItemId}`;
  }
}
