import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RescheduleInventoryPort } from "../../domain/ports/reschedule-inventory.port";
import { RescheduleInventoryRequest } from "../../domain/models/reschedule-inventory-request.model";

@Injectable()
export class HttpRescheduleInventoryAdapter extends RescheduleInventoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  rescheduleInventory(
    inventoryId: string,
    request: RescheduleInventoryRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${inventoryId}/schedule`,
      request,
    );
  }
}
