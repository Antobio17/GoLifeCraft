import { Observable } from "rxjs";
import { GetPantryLocationPort } from "../../domain/ports/get-pantry-location.port";
import { GetPantryLocationResponse } from "../../domain/models/get-pantry-location-response.model";

export class GetPantryLocationService {
  constructor(private getPantryLocationPort: GetPantryLocationPort) {}

  getPantryLocation(locationId: string): Observable<GetPantryLocationResponse> {
    return this.getPantryLocationPort.getPantryLocation(locationId);
  }
}
