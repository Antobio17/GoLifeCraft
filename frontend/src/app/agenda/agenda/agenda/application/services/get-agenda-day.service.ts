import { Observable } from "rxjs";
import { GetAgendaDayPort } from "../../domain/ports/get-agenda-day.port";
import { GetAgendaDayResponse } from "../../domain/models/agenda.model";

export class GetAgendaDayService {
  constructor(private getAgendaDayPort: GetAgendaDayPort) {}

  getAgendaDay(date: string): Observable<GetAgendaDayResponse> {
    return this.getAgendaDayPort.getAgendaDay(date);
  }
}
