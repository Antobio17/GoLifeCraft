import { Observable } from "rxjs";
import { GetPantryLocationCandidatesPort } from "../../domain/ports/get-pantry-location-candidates.port";
import { GetPantryLocationCandidatesResponse } from "../../domain/models/get-pantry-location-candidates-response.model";

export class GetPantryLocationCandidatesService {
  constructor(
    private getPantryLocationCandidatesPort: GetPantryLocationCandidatesPort,
  ) {}

  getPantryLocationCandidates(
    locationId: string,
    page: number = 1,
    pageSize: number = 20,
    filterName?: string,
    filterKind?: string,
  ): Observable<GetPantryLocationCandidatesResponse> {
    return this.getPantryLocationCandidatesPort.getPantryLocationCandidates(
      locationId,
      page,
      pageSize,
      filterName,
      filterKind,
    );
  }
}
