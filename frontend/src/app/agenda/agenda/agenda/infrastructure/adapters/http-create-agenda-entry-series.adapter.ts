import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateAgendaEntrySeriesPort } from "../../domain/ports/create-agenda-entry-series.port";
import { AgendaEntrySeriesPayload } from "../../domain/models/agenda-entry-payload.model";

@Injectable()
export class HttpCreateAgendaEntrySeriesAdapter extends CreateAgendaEntrySeriesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda/series";

  createAgendaEntrySeries(payload: AgendaEntrySeriesPayload): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }
}
