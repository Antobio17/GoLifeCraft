import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FinishProductionPort } from "../../domain/ports/finish-production.port";

@Injectable()
export class HttpFinishProductionAdapter extends FinishProductionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  finishProduction(productionId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${productionId}/finish`, {});
  }
}
