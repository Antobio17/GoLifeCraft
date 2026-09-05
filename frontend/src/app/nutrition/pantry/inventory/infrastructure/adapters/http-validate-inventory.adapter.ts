import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ValidateInventoryPort } from "../../domain/ports/validate-inventory.port";

@Injectable()
export class HttpValidateInventoryAdapter extends ValidateInventoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  validateInventory(inventoryId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${inventoryId}/validate`, {});
  }
}
