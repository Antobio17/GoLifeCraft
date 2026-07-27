import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateAgendaEntrySeriesPort } from "../../domain/ports/update-agenda-entry-series.port";
import { AgendaEntrySeriesPayload } from "../../domain/models/agenda-entry-payload.model";

@Injectable()
export class HttpUpdateAgendaEntrySeriesAdapter extends UpdateAgendaEntrySeriesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda/series";

  updateAgendaEntrySeries(
    seriesId: string,
    payload: AgendaEntrySeriesPayload,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${seriesId}`, payload);
  }
}
