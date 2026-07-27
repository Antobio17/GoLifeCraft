import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetAgendaSeriesPort } from "../../domain/ports/get-agenda-series.port";
import { GetAgendaSeriesResponse } from "../../domain/models/agenda-series.model";

@Injectable()
export class HttpGetAgendaSeriesAdapter extends GetAgendaSeriesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda/series";

  getAgendaSeries(seriesId: string): Observable<GetAgendaSeriesResponse> {
    return this.http.get<GetAgendaSeriesResponse>(`${this.apiUrl}/${seriesId}`);
  }
}
