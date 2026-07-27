import { Observable } from "rxjs";
import { AgendaEntrySeriesPayload } from "../models/agenda-entry-payload.model";

export abstract class CreateAgendaEntrySeriesPort {
  abstract createAgendaEntrySeries(
    payload: AgendaEntrySeriesPayload,
  ): Observable<void>;
}
