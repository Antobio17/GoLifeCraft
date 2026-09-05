import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeletePantryLocationPort } from "../../domain/ports/delete-pantry-location.port";

@Injectable()
export class HttpDeletePantryLocationAdapter extends DeletePantryLocationPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  deletePantryLocation(locationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${locationId}`);
  }
}
