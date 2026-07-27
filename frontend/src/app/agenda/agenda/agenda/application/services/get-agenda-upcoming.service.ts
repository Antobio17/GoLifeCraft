import { Observable } from "rxjs";
import { GetAgendaUpcomingPort } from "../../domain/ports/get-agenda-upcoming.port";
import { GetAgendaUpcomingResponse } from "../../domain/models/agenda.model";

export class GetAgendaUpcomingService {
  constructor(private getAgendaUpcomingPort: GetAgendaUpcomingPort) {}

  getAgendaUpcoming(
    fromDate: string,
    days: number,
  ): Observable<GetAgendaUpcomingResponse> {
    return this.getAgendaUpcomingPort.getAgendaUpcoming(fromDate, days);
  }
}
