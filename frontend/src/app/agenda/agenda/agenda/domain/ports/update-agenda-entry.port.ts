import { Observable } from "rxjs";
import { AgendaEntryPayload } from "../models/agenda-entry-payload.model";

export abstract class UpdateAgendaEntryPort {
  abstract updateAgendaEntry(
    agendaEntryId: string,
    payload: AgendaEntryPayload,
  ): Observable<void>;
}
