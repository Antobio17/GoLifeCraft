import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateSupermarketPort } from "../../domain/ports/update-supermarket.port";
import { UpdateSupermarketRequest } from "../../domain/models/update-supermarket.model";

@Injectable()
export class HttpUpdateSupermarketAdapter extends UpdateSupermarketPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/supermarket";

  updateSupermarket(
    id: string,
    request: UpdateSupermarketRequest,
  ): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + id, request);
  }
}
