import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetAgendaUpcomingPort } from "../../domain/ports/get-agenda-upcoming.port";
import { GetAgendaUpcomingResponse } from "../../domain/models/agenda.model";

@Injectable()
export class HttpGetAgendaUpcomingAdapter extends GetAgendaUpcomingPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda/upcoming";

  getAgendaUpcoming(
    fromDate: string,
    days: number,
  ): Observable<GetAgendaUpcomingResponse> {
    const params = new HttpParams()
      .set("from", fromDate)
      .set("days", days.toString());

    return this.http.get<GetAgendaUpcomingResponse>(this.apiUrl, { params });
  }
}
