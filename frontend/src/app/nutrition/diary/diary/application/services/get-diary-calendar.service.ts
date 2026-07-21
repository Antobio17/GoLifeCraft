import { Observable } from "rxjs";
import { GetDiaryCalendarPort } from "../../domain/ports/get-diary-calendar.port";
import { GetDiaryCalendarResponse } from "../../domain/models/diary-calendar.model";

export class GetDiaryCalendarService {
  constructor(private getDiaryCalendarPort: GetDiaryCalendarPort) {}

  getDiaryCalendar(month: string): Observable<GetDiaryCalendarResponse> {
    return this.getDiaryCalendarPort.getDiaryCalendar(month);
  }
}
