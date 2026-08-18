import { Observable } from "rxjs";
import { GetFinanceRecurrencesResponse } from "../models/get-finance-recurrences-response.model";

export abstract class GetFinanceRecurrencesPort {
  abstract getFinanceRecurrences(): Observable<GetFinanceRecurrencesResponse>;
}
