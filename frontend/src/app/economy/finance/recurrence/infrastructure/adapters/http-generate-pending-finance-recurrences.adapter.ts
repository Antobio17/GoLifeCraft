import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GeneratePendingFinanceRecurrencesPort } from "../../domain/ports/generate-pending-finance-recurrences.port";
import { GeneratePendingFinanceRecurrencesResponse } from "../../domain/models/generate-pending-finance-recurrences-response.model";

@Injectable()
export class HttpGeneratePendingFinanceRecurrencesAdapter extends GeneratePendingFinanceRecurrencesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/recurrences/run";

  generatePendingFinanceRecurrences(): Observable<GeneratePendingFinanceRecurrencesResponse> {
    return this.http.post<GeneratePendingFinanceRecurrencesResponse>(
      this.apiUrl,
      {},
    );
  }
}
