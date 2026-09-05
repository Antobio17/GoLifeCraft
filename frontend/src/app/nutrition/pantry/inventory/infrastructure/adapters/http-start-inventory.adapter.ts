import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { StartInventoryPort } from "../../domain/ports/start-inventory.port";
import { StartInventoryRequest } from "../../domain/models/start-inventory-request.model";

@Injectable()
export class HttpStartInventoryAdapter extends StartInventoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  startInventory(request: StartInventoryRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
