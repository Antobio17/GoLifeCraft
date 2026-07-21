import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetDiaryCalendarPort } from "../../domain/ports/get-diary-calendar.port";
import { GetDiaryCalendarResponse } from "../../domain/models/diary-calendar.model";

@Injectable()
export class HttpGetDiaryCalendarAdapter extends GetDiaryCalendarPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary/calendar";

  getDiaryCalendar(month: string): Observable<GetDiaryCalendarResponse> {
    const params = new HttpParams().set("month", month);

    return this.http.get<GetDiaryCalendarResponse>(this.apiUrl, { params });
  }
}
