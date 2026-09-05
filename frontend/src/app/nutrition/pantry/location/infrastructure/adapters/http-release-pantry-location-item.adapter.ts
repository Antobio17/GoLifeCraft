import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ReleasePantryLocationItemPort } from "../../domain/ports/release-pantry-location-item.port";
import { PantryLocationItemKind } from "../../domain/models/pantry-location-item-kind.model";

@Injectable()
export class HttpReleasePantryLocationItemAdapter extends ReleasePantryLocationItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  releasePantryLocationItem(
    locationId: string,
    kind: PantryLocationItemKind,
    refId: string,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${locationId}/items/${kind}/${refId}`,
    );
  }
}
