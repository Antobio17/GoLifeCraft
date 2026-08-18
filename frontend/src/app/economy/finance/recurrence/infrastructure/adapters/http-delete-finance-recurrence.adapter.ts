import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteFinanceRecurrencePort } from "../../domain/ports/delete-finance-recurrence.port";

@Injectable()
export class HttpDeleteFinanceRecurrenceAdapter extends DeleteFinanceRecurrencePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/recurrences";

  deleteFinanceRecurrence(financeRecurrenceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${financeRecurrenceId}`);
  }
}
