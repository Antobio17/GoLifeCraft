import { Observable } from "rxjs";
import { GetFinanceCalendarResponse } from "../models/get-finance-calendar-response.model";

export abstract class GetFinanceCalendarPort {
  abstract getFinanceCalendar(
    month: string,
  ): Observable<GetFinanceCalendarResponse>;
}
