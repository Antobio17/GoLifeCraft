import { Observable } from "rxjs";
import { CreateAgendaEntrySeriesPort } from "../../domain/ports/create-agenda-entry-series.port";
import { AgendaEntrySeriesPayload } from "../../domain/models/agenda-entry-payload.model";

export class CreateAgendaEntrySeriesService {
  constructor(
    private createAgendaEntrySeriesPort: CreateAgendaEntrySeriesPort,
  ) {}

  createAgendaEntrySeries(payload: AgendaEntrySeriesPayload): Observable<void> {
    return this.createAgendaEntrySeriesPort.createAgendaEntrySeries(payload);
  }
}
