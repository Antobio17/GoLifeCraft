import { Observable } from "rxjs";
import { DeletePantryLocationPort } from "../../domain/ports/delete-pantry-location.port";

export class DeletePantryLocationService {
  constructor(private deletePantryLocationPort: DeletePantryLocationPort) {}

  deletePantryLocation(locationId: string): Observable<void> {
    return this.deletePantryLocationPort.deletePantryLocation(locationId);
  }
}
