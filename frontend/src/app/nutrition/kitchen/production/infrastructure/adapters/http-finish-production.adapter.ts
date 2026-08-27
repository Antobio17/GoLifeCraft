import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FinishProductionPort } from "../../domain/ports/finish-production.port";
import { FinishProductionRequest } from "../../domain/models/finish-production-request.model";

@Injectable()
export class HttpFinishProductionAdapter extends FinishProductionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  finishProduction(
    id: string,
    request: FinishProductionRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/finish`, request);
  }
}
