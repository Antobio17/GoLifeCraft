import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/update-shopping-list-item.port";
import { UpdateShoppingListItemRequest } from "@nutrition/shopping/shopping/domain/models/update-shopping-list-item.model";

@Injectable()
export class HttpUpdateShoppingListItemAdapter extends UpdateShoppingListItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping-list";

  updateShoppingListItem(
    itemId: string,
    request: UpdateShoppingListItemRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${itemId}`, request);
  }
}
