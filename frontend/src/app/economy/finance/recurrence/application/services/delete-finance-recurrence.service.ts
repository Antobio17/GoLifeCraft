import { Observable } from "rxjs";
import { DeleteFinanceRecurrencePort } from "../../domain/ports/delete-finance-recurrence.port";

export class DeleteFinanceRecurrenceService {
  constructor(
    private deleteFinanceRecurrencePort: DeleteFinanceRecurrencePort,
  ) {}

  deleteFinanceRecurrence(financeRecurrenceId: string): Observable<void> {
    return this.deleteFinanceRecurrencePort.deleteFinanceRecurrence(
      financeRecurrenceId,
    );
  }
}
