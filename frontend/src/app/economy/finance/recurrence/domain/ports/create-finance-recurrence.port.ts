import { Observable } from "rxjs";
import { FinanceRecurrencePayload } from "../models/finance-recurrence-payload.model";

export abstract class CreateFinanceRecurrencePort {
  abstract createFinanceRecurrence(
    payload: FinanceRecurrencePayload,
  ): Observable<void>;
}
