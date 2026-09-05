import { Observable } from "rxjs";
import { ReleasePantryLocationItemPort } from "../../domain/ports/release-pantry-location-item.port";
import { PantryLocationItemKind } from "../../domain/models/pantry-location-item-kind.model";

export class ReleasePantryLocationItemService {
  constructor(
    private releasePantryLocationItemPort: ReleasePantryLocationItemPort,
  ) {}

  releasePantryLocationItem(
    locationId: string,
    kind: PantryLocationItemKind,
    refId: string,
  ): Observable<void> {
    return this.releasePantryLocationItemPort.releasePantryLocationItem(
      locationId,
      kind,
      refId,
    );
  }
}
