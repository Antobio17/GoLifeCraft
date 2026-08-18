import { Observable } from "rxjs";
import { UpdateFinanceRecurrencePort } from "../../domain/ports/update-finance-recurrence.port";
import { FinanceRecurrencePayload } from "../../domain/models/finance-recurrence-payload.model";

export class UpdateFinanceRecurrenceService {
  constructor(
    private updateFinanceRecurrencePort: UpdateFinanceRecurrencePort,
  ) {}

  updateFinanceRecurrence(
    financeRecurrenceId: string,
    payload: FinanceRecurrencePayload,
  ): Observable<void> {
    return this.updateFinanceRecurrencePort.updateFinanceRecurrence(
      financeRecurrenceId,
      payload,
    );
  }
}
