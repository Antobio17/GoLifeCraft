import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DiscardInventoryPort } from "../../domain/ports/discard-inventory.port";

@Injectable()
export class HttpDiscardInventoryAdapter extends DiscardInventoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  discardInventory(inventoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${inventoryId}`);
  }
}
