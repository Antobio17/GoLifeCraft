import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetPantryLocationsPort } from "../../domain/ports/get-pantry-locations.port";
import { GetPantryLocationsResponse } from "../../domain/models/get-pantry-locations-response.model";

@Injectable()
export class HttpGetPantryLocationsAdapter extends GetPantryLocationsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  getPantryLocations(
    page: number = 1,
    pageSize: number = 20,
    filterName?: string,
  ): Observable<GetPantryLocationsResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    return this.http.get<GetPantryLocationsResponse>(this.apiUrl, { params });
  }
}
