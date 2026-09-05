import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdatePantryLocationPort } from "../../domain/ports/update-pantry-location.port";
import { UpdatePantryLocationRequest } from "../../domain/models/update-pantry-location-request.model";

@Injectable()
export class HttpUpdatePantryLocationAdapter extends UpdatePantryLocationPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  updatePantryLocation(
    locationId: string,
    request: UpdatePantryLocationRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${locationId}`, request);
  }
}
