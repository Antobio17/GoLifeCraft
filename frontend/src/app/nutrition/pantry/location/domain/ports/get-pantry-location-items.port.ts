import { Observable } from "rxjs";
import { GetPantryLocationItemsResponse } from "../models/get-pantry-location-items-response.model";

export abstract class GetPantryLocationItemsPort {
  abstract getPantryLocationItems(
    locationId: string,
  ): Observable<GetPantryLocationItemsResponse>;
}
