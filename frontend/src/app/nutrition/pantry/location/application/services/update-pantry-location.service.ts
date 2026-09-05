import { Observable } from "rxjs";
import { UpdatePantryLocationPort } from "../../domain/ports/update-pantry-location.port";
import { UpdatePantryLocationRequest } from "../../domain/models/update-pantry-location-request.model";

export class UpdatePantryLocationService {
  constructor(private updatePantryLocationPort: UpdatePantryLocationPort) {}

  updatePantryLocation(
    locationId: string,
    request: UpdatePantryLocationRequest,
  ): Observable<void> {
    return this.updatePantryLocationPort.updatePantryLocation(
      locationId,
      request,
    );
  }
}
