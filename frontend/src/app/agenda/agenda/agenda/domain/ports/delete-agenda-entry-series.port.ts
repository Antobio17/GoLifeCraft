import { Observable } from "rxjs";

export abstract class DeleteAgendaEntrySeriesPort {
  abstract deleteAgendaEntrySeries(seriesId: string): Observable<void>;
}
