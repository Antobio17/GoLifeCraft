import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceCalendarPort } from "../../domain/ports/get-finance-calendar.port";
import { GetFinanceCalendarResponse } from "../../domain/models/get-finance-calendar-response.model";

@Injectable()
export class HttpGetFinanceCalendarAdapter extends GetFinanceCalendarPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/calendar";

  getFinanceCalendar(month: string): Observable<GetFinanceCalendarResponse> {
    const params = new HttpParams().set("month", month);

    return this.http.get<GetFinanceCalendarResponse>(this.apiUrl, { params });
  }
}
