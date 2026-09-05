import { Observable } from "rxjs";
import { AssignPantryLocationItemPort } from "../../domain/ports/assign-pantry-location-item.port";
import { AssignPantryLocationItemRequest } from "../../domain/models/assign-pantry-location-item-request.model";

export class AssignPantryLocationItemService {
  constructor(
    private assignPantryLocationItemPort: AssignPantryLocationItemPort,
  ) {}

  assignPantryLocationItem(
    locationId: string,
    request: AssignPantryLocationItemRequest,
  ): Observable<void> {
    return this.assignPantryLocationItemPort.assignPantryLocationItem(
      locationId,
      request,
    );
  }
}
