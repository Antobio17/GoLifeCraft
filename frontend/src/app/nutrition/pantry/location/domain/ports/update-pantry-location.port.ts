import { Observable } from "rxjs";
import { UpdatePantryLocationRequest } from "../models/update-pantry-location-request.model";

export abstract class UpdatePantryLocationPort {
  abstract updatePantryLocation(
    locationId: string,
    request: UpdatePantryLocationRequest,
  ): Observable<void>;
}
