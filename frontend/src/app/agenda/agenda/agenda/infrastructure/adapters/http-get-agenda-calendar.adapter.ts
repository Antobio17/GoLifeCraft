import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetAgendaCalendarPort } from "../../domain/ports/get-agenda-calendar.port";
import { GetAgendaCalendarResponse } from "../../domain/models/agenda-calendar.model";

@Injectable()
export class HttpGetAgendaCalendarAdapter extends GetAgendaCalendarPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda/calendar";

  getAgendaCalendar(month: string): Observable<GetAgendaCalendarResponse> {
    const params = new HttpParams().set("month", month);

    return this.http.get<GetAgendaCalendarResponse>(this.apiUrl, { params });
  }
}
