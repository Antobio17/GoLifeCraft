import { Observable } from "rxjs";
import { UpdateAgendaEntrySeriesPort } from "../../domain/ports/update-agenda-entry-series.port";
import { AgendaEntrySeriesPayload } from "../../domain/models/agenda-entry-payload.model";

export class UpdateAgendaEntrySeriesService {
  constructor(
    private updateAgendaEntrySeriesPort: UpdateAgendaEntrySeriesPort,
  ) {}

  updateAgendaEntrySeries(
    seriesId: string,
    payload: AgendaEntrySeriesPayload,
  ): Observable<void> {
    return this.updateAgendaEntrySeriesPort.updateAgendaEntrySeries(
      seriesId,
      payload,
    );
  }
}
