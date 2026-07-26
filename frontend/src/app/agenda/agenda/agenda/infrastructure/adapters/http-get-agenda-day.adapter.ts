import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetAgendaDayPort } from "../../domain/ports/get-agenda-day.port";
import { GetAgendaDayResponse } from "../../domain/models/agenda.model";

@Injectable()
export class HttpGetAgendaDayAdapter extends GetAgendaDayPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda";

  getAgendaDay(date: string): Observable<GetAgendaDayResponse> {
    const params = new HttpParams().set("date", date);

    return this.http.get<GetAgendaDayResponse>(this.apiUrl, { params });
  }
}
