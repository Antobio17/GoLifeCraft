import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/delete-shopping-list-item.port";

@Injectable()
export class HttpDeleteShoppingListItemAdapter extends DeleteShoppingListItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping-list";

  deleteShoppingListItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`);
  }
}
