import { Observable } from "rxjs";
import { GetAgendaCalendarPort } from "../../domain/ports/get-agenda-calendar.port";
import { GetAgendaCalendarResponse } from "../../domain/models/agenda-calendar.model";

export class GetAgendaCalendarService {
  constructor(private getAgendaCalendarPort: GetAgendaCalendarPort) {}

  getAgendaCalendar(month: string): Observable<GetAgendaCalendarResponse> {
    return this.getAgendaCalendarPort.getAgendaCalendar(month);
  }
}
