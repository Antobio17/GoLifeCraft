import { Observable } from "rxjs";

export abstract class DeletePantryLocationPort {
  abstract deletePantryLocation(locationId: string): Observable<void>;
}
