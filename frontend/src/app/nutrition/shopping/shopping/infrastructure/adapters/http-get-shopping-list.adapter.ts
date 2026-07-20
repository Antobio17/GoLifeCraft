import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetShoppingListPort } from "@nutrition/shopping/shopping/domain/ports/get-shopping-list.port";
import { GetShoppingListResponse } from "@nutrition/shopping/shopping/domain/models/get-shopping-list-response.model";

@Injectable()
export class HttpGetShoppingListAdapter extends GetShoppingListPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping-list";

  getShoppingList(): Observable<GetShoppingListResponse> {
    return this.http.get<GetShoppingListResponse>(this.apiUrl);
  }
}
