import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ReopenProductionPort } from "../../domain/ports/reopen-production.port";

@Injectable()
export class HttpReopenProductionAdapter extends ReopenProductionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  reopenProduction(productionId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${productionId}/reopen`, {});
  }
}
