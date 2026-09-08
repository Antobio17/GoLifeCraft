import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ReopenInventoryPort } from "../../domain/ports/reopen-inventory.port";

@Injectable()
export class HttpReopenInventoryAdapter extends ReopenInventoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  reopenInventory(inventoryId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${inventoryId}/reopen`, {});
  }
}
