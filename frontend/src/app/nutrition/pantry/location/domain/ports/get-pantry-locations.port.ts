import { Observable } from "rxjs";
import { GetPantryLocationsResponse } from "../models/get-pantry-locations-response.model";

export abstract class GetPantryLocationsPort {
  abstract getPantryLocations(
    page?: number,
    pageSize?: number,
    filterName?: string,
  ): Observable<GetPantryLocationsResponse>;
}
