import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetPantryLocationPort } from "../../domain/ports/get-pantry-location.port";
import { GetPantryLocationResponse } from "../../domain/models/get-pantry-location-response.model";

@Injectable()
export class HttpGetPantryLocationAdapter extends GetPantryLocationPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  getPantryLocation(locationId: string): Observable<GetPantryLocationResponse> {
    return this.http.get<GetPantryLocationResponse>(
      `${this.apiUrl}/${locationId}`,
    );
  }
}
