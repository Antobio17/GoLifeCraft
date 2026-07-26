import { Observable } from "rxjs";
import { GetAgendaDayResponse } from "../models/agenda.model";

export abstract class GetAgendaDayPort {
  abstract getAgendaDay(date: string): Observable<GetAgendaDayResponse>;
}
