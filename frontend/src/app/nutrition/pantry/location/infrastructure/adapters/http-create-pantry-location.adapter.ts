import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreatePantryLocationPort } from "../../domain/ports/create-pantry-location.port";
import { CreatePantryLocationRequest } from "../../domain/models/create-pantry-location-request.model";

@Injectable()
export class HttpCreatePantryLocationAdapter extends CreatePantryLocationPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/locations";

  createPantryLocation(request: CreatePantryLocationRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
