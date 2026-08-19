import { Observable } from "rxjs";
import { GeneratePendingFinanceRecurrencesResponse } from "../models/generate-pending-finance-recurrences-response.model";

export abstract class GeneratePendingFinanceRecurrencesPort {
  abstract generatePendingFinanceRecurrences(): Observable<GeneratePendingFinanceRecurrencesResponse>;
}
