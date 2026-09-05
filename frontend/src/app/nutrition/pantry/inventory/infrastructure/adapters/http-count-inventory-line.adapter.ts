import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CountInventoryLinePort } from "../../domain/ports/count-inventory-line.port";
import { CountInventoryLineRequest } from "../../domain/models/count-inventory-line-request.model";

@Injectable()
export class HttpCountInventoryLineAdapter extends CountInventoryLinePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  countInventoryLine(
    inventoryId: string,
    lineId: string,
    request: CountInventoryLineRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${inventoryId}/lines/${lineId}`,
      request,
    );
  }
}
