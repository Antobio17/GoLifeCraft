import { Observable } from "rxjs";
import { AgendaEntrySeriesPayload } from "../models/agenda-entry-payload.model";

export abstract class UpdateAgendaEntrySeriesPort {
  abstract updateAgendaEntrySeries(
    seriesId: string,
    payload: AgendaEntrySeriesPayload,
  ): Observable<void>;
}
