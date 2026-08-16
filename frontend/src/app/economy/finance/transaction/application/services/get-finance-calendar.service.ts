import { Observable } from "rxjs";
import { GetFinanceCalendarPort } from "../../domain/ports/get-finance-calendar.port";
import { GetFinanceCalendarResponse } from "../../domain/models/get-finance-calendar-response.model";

export class GetFinanceCalendarService {
  constructor(private getFinanceCalendarPort: GetFinanceCalendarPort) {}

  getFinanceCalendar(month: string): Observable<GetFinanceCalendarResponse> {
    return this.getFinanceCalendarPort.getFinanceCalendar(month);
  }
}
