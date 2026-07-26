import { Observable } from "rxjs";
import { GetAgendaCalendarResponse } from "../models/agenda-calendar.model";

export abstract class GetAgendaCalendarPort {
  abstract getAgendaCalendar(
    month: string,
  ): Observable<GetAgendaCalendarResponse>;
}
