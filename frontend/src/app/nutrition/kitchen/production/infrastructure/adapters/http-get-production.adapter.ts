import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetProductionPort } from "../../domain/ports/get-production.port";
import { GetProductionResponse } from "../../domain/models/get-production-response.model";

@Injectable()
export class HttpGetProductionAdapter extends GetProductionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  getProduction(id: string): Observable<GetProductionResponse> {
    return this.http.get<GetProductionResponse>(`${this.apiUrl}/${id}`);
  }
}
