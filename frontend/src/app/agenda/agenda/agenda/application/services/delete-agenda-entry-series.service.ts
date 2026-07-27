import { Observable } from "rxjs";
import { DeleteAgendaEntrySeriesPort } from "../../domain/ports/delete-agenda-entry-series.port";

export class DeleteAgendaEntrySeriesService {
  constructor(
    private deleteAgendaEntrySeriesPort: DeleteAgendaEntrySeriesPort,
  ) {}

  deleteAgendaEntrySeries(seriesId: string): Observable<void> {
    return this.deleteAgendaEntrySeriesPort.deleteAgendaEntrySeries(seriesId);
  }
}
