import { Observable } from "rxjs";

export abstract class DeleteFinanceRecurrencePort {
  abstract deleteFinanceRecurrence(
    financeRecurrenceId: string,
  ): Observable<void>;
}
