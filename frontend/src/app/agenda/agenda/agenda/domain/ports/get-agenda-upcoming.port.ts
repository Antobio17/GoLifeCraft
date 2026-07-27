import { Observable } from "rxjs";
import { GetAgendaUpcomingResponse } from "../models/agenda.model";

export abstract class GetAgendaUpcomingPort {
  abstract getAgendaUpcoming(
    fromDate: string,
    days: number,
  ): Observable<GetAgendaUpcomingResponse>;
}
