import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DiscardProductionPort } from "../../domain/ports/discard-production.port";

@Injectable()
export class HttpDiscardProductionAdapter extends DiscardProductionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  discardProduction(productionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productionId}`);
  }
}
