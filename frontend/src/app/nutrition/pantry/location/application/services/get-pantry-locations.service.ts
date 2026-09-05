import { Observable } from "rxjs";
import { GetPantryLocationsPort } from "../../domain/ports/get-pantry-locations.port";
import { GetPantryLocationsResponse } from "../../domain/models/get-pantry-locations-response.model";

export class GetPantryLocationsService {
  constructor(private getPantryLocationsPort: GetPantryLocationsPort) {}

  getPantryLocations(
    page: number = 1,
    pageSize: number = 20,
    filterName?: string,
  ): Observable<GetPantryLocationsResponse> {
    return this.getPantryLocationsPort.getPantryLocations(
      page,
      pageSize,
      filterName,
    );
  }
}
