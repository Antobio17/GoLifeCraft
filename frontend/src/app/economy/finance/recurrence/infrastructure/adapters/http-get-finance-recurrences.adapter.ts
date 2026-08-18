import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceRecurrencesPort } from "../../domain/ports/get-finance-recurrences.port";
import { GetFinanceRecurrencesResponse } from "../../domain/models/get-finance-recurrences-response.model";

@Injectable()
export class HttpGetFinanceRecurrencesAdapter extends GetFinanceRecurrencesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/recurrences";

  getFinanceRecurrences(): Observable<GetFinanceRecurrencesResponse> {
    return this.http.get<GetFinanceRecurrencesResponse>(this.apiUrl);
  }
}
