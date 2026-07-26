import { Observable } from "rxjs";
import { AgendaEntryPayload } from "../models/agenda-entry-payload.model";

export abstract class CreateAgendaEntryPort {
  abstract createAgendaEntry(payload: AgendaEntryPayload): Observable<void>;
}
