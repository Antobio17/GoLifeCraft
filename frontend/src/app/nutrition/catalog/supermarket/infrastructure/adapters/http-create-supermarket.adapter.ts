import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateSupermarketPort } from "../../domain/ports/create-supermarket.port";
import { CreateSupermarketRequest } from "../../domain/models/create-supermarket.model";

@Injectable()
export class HttpCreateSupermarketAdapter extends CreateSupermarketPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/supermarket";

  createSupermarket(request: CreateSupermarketRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
