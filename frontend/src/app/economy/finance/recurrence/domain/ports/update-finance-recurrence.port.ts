import { Observable } from "rxjs";
import { FinanceRecurrencePayload } from "../models/finance-recurrence-payload.model";

export abstract class UpdateFinanceRecurrencePort {
  abstract updateFinanceRecurrence(
    financeRecurrenceId: string,
    payload: FinanceRecurrencePayload,
  ): Observable<void>;
}
