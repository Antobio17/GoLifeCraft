import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetPantryLocationItemsPort } from "../../domain/ports/get-pantry-location-items.port";
import { GetPantryLocationItemsResponse } from "../../domain/models/get-pantry-location-items-response.model";

@Injectable()
export class HttpGetPantryLocationItemsAdapter extends GetPantryLocationItemsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  getPantryLocationItems(
    locationId: string,
  ): Observable<GetPantryLocationItemsResponse> {
    return this.http.get<GetPantryLocationItemsResponse>(
      `${this.apiUrl}/${locationId}/items`,
    );
  }
}
