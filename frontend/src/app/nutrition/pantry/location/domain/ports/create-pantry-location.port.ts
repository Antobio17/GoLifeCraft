import { Observable } from "rxjs";
import { CreatePantryLocationRequest } from "../models/create-pantry-location-request.model";

export abstract class CreatePantryLocationPort {
  abstract createPantryLocation(
    request: CreatePantryLocationRequest,
  ): Observable<void>;
}
