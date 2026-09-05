import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AssignPantryLocationItemPort } from "../../domain/ports/assign-pantry-location-item.port";
import { AssignPantryLocationItemRequest } from "../../domain/models/assign-pantry-location-item-request.model";

@Injectable()
export class HttpAssignPantryLocationItemAdapter extends AssignPantryLocationItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  assignPantryLocationItem(
    locationId: string,
    request: AssignPantryLocationItemRequest,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${locationId}/items`, request);
  }
}
