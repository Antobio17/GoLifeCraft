import { Observable } from "rxjs";
import { GetPantryLocationCandidatesResponse } from "../models/get-pantry-location-candidates-response.model";

export abstract class GetPantryLocationCandidatesPort {
  abstract getPantryLocationCandidates(
    locationId: string,
    page?: number,
    pageSize?: number,
    filterName?: string,
    filterKind?: string,
  ): Observable<GetPantryLocationCandidatesResponse>;
}
