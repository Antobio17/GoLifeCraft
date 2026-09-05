import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CountInventoryItemPort } from "../../domain/ports/count-inventory-item.port";
import { CountInventoryItemRequest } from "../../domain/models/count-inventory-item-request.model";

@Injectable()
export class HttpCountInventoryItemAdapter extends CountInventoryItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  countInventoryItem(
    inventoryId: string,
    itemId: string,
    request: CountInventoryItemRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${inventoryId}/items/${itemId}`,
      request,
    );
  }
}
