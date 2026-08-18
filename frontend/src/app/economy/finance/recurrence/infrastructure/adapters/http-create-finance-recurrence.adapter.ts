import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateFinanceRecurrencePort } from "../../domain/ports/create-finance-recurrence.port";
import { FinanceRecurrencePayload } from "../../domain/models/finance-recurrence-payload.model";

@Injectable()
export class HttpCreateFinanceRecurrenceAdapter extends CreateFinanceRecurrencePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/recurrences";

  createFinanceRecurrence(payload: FinanceRecurrencePayload): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }
}
