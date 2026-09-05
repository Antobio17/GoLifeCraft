import { Observable } from "rxjs";
import { CreatePantryLocationPort } from "../../domain/ports/create-pantry-location.port";
import { CreatePantryLocationRequest } from "../../domain/models/create-pantry-location-request.model";

export class CreatePantryLocationService {
  constructor(private createPantryLocationPort: CreatePantryLocationPort) {}

  createPantryLocation(request: CreatePantryLocationRequest): Observable<void> {
    return this.createPantryLocationPort.createPantryLocation(request);
  }
}
