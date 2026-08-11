import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateSupermarketAislesPort } from "../../domain/ports/update-supermarket-aisles.port";
import { UpdateSupermarketAislesRequest } from "../../domain/models/update-supermarket-aisles.model";

@Injectable()
export class HttpUpdateSupermarketAislesAdapter extends UpdateSupermarketAislesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/supermarket";

  updateSupermarketAisles(
    supermarketId: string,
    request: UpdateSupermarketAislesRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${supermarketId}/aisles`,
      request,
    );
  }
}
