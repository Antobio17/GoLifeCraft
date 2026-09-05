import { Observable } from "rxjs";
import { GetPantryLocationResponse } from "../models/get-pantry-location-response.model";

export abstract class GetPantryLocationPort {
  abstract getPantryLocation(
    locationId: string,
  ): Observable<GetPantryLocationResponse>;
}
