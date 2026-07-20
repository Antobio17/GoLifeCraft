import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AddShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/add-shopping-list-item.port";
import { AddShoppingListItemRequest } from "@nutrition/shopping/shopping/domain/models/add-shopping-list-item.model";

@Injectable()
export class HttpAddShoppingListItemAdapter extends AddShoppingListItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping-list";

  addShoppingListItem(request: AddShoppingListItemRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
