import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetInventoryPort } from "../../domain/ports/get-inventory.port";
import { GetInventoryResponse } from "../../domain/models/get-inventory-response.model";

@Injectable()
export class HttpGetInventoryAdapter extends GetInventoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  getInventory(inventoryId: string): Observable<GetInventoryResponse> {
    return this.http.get<GetInventoryResponse>(`${this.apiUrl}/${inventoryId}`);
  }
}
