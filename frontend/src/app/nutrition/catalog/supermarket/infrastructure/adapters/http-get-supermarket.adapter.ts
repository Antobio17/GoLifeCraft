import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetSupermarketPort } from "../../domain/ports/get-supermarket.port";
import { GetSupermarketResponse } from "../../domain/models/get-supermarket-response.model";

@Injectable()
export class HttpGetSupermarketAdapter extends GetSupermarketPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/supermarket";

  getSupermarket(id: string): Observable<GetSupermarketResponse> {
    return this.http.get<GetSupermarketResponse>(this.apiUrl + "/" + id);
  }
}
