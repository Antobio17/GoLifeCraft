import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetPantryLocationCandidatesPort } from "../../domain/ports/get-pantry-location-candidates.port";
import { GetPantryLocationCandidatesResponse } from "../../domain/models/get-pantry-location-candidates-response.model";

@Injectable()
export class HttpGetPantryLocationCandidatesAdapter extends GetPantryLocationCandidatesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  getPantryLocationCandidates(
    locationId: string,
    page: number = 1,
    pageSize: number = 20,
    filterName?: string,
    filterKind?: string,
  ): Observable<GetPantryLocationCandidatesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    if (filterKind) {
      params = params.set("filter[kind]", filterKind);
    }

    return this.http.get<GetPantryLocationCandidatesResponse>(
      `${this.apiUrl}/${locationId}/candidates`,
      { params },
    );
  }
}
