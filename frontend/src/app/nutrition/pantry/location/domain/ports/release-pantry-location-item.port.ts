import { Observable } from "rxjs";
import { PantryLocationItemKind } from "../models/pantry-location-item-kind.model";

export abstract class ReleasePantryLocationItemPort {
  abstract releasePantryLocationItem(
    locationId: string,
    kind: PantryLocationItemKind,
    refId: string,
  ): Observable<void>;
}
