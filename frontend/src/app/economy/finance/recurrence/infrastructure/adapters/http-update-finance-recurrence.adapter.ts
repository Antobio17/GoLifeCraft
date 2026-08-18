import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateFinanceRecurrencePort } from "../../domain/ports/update-finance-recurrence.port";
import { FinanceRecurrencePayload } from "../../domain/models/finance-recurrence-payload.model";

@Injectable()
export class HttpUpdateFinanceRecurrenceAdapter extends UpdateFinanceRecurrencePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/recurrences";

  updateFinanceRecurrence(
    financeRecurrenceId: string,
    payload: FinanceRecurrencePayload,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${financeRecurrenceId}`,
      payload,
    );
  }
}
