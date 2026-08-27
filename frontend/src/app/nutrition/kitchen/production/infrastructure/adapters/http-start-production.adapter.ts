import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { StartProductionPort } from "../../domain/ports/start-production.port";
import { StartProductionRequest } from "../../domain/models/start-production-request.model";

@Injectable()
export class HttpStartProductionAdapter extends StartProductionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  startProduction(request: StartProductionRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
