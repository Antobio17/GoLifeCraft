import { Observable } from "rxjs";
import { CreateFinanceRecurrencePort } from "../../domain/ports/create-finance-recurrence.port";
import { FinanceRecurrencePayload } from "../../domain/models/finance-recurrence-payload.model";

export class CreateFinanceRecurrenceService {
  constructor(
    private createFinanceRecurrencePort: CreateFinanceRecurrencePort,
  ) {}

  createFinanceRecurrence(payload: FinanceRecurrencePayload): Observable<void> {
    return this.createFinanceRecurrencePort.createFinanceRecurrence(payload);
  }
}
