import { Observable } from "rxjs";
import { AssignPantryLocationItemRequest } from "../models/assign-pantry-location-item-request.model";

export abstract class AssignPantryLocationItemPort {
  abstract assignPantryLocationItem(
    locationId: string,
    request: AssignPantryLocationItemRequest,
  ): Observable<void>;
}
