import { Observable } from "rxjs";
import { GetPantryLocationItemsPort } from "../../domain/ports/get-pantry-location-items.port";
import { GetPantryLocationItemsResponse } from "../../domain/models/get-pantry-location-items-response.model";

export class GetPantryLocationItemsService {
  constructor(private getPantryLocationItemsPort: GetPantryLocationItemsPort) {}

  getPantryLocationItems(
    locationId: string,
  ): Observable<GetPantryLocationItemsResponse> {
    return this.getPantryLocationItemsPort.getPantryLocationItems(locationId);
  }
}
