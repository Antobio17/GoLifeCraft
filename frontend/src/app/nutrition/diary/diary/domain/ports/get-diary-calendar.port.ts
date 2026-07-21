import { Observable } from "rxjs";
import { GetDiaryCalendarResponse } from "../models/diary-calendar.model";

export abstract class GetDiaryCalendarPort {
  abstract getDiaryCalendar(
    month: string,
  ): Observable<GetDiaryCalendarResponse>;
}
