import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteAgendaEntrySeriesPort } from "../../domain/ports/delete-agenda-entry-series.port";

@Injectable()
export class HttpDeleteAgendaEntrySeriesAdapter extends DeleteAgendaEntrySeriesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda/series";

  deleteAgendaEntrySeries(seriesId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${seriesId}`);
  }
}
