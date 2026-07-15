import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetDiaryPort } from "../../domain/ports/get-diary.port";
import { GetDiaryResponse } from "../../domain/models/get-diary-response.model";

@Injectable()
export class HttpGetDiaryAdapter extends GetDiaryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  getDiary(date?: string): Observable<GetDiaryResponse> {
    let params = new HttpParams();

    if (date) {
      params = params.set("date", date);
    }

    return this.http.get<GetDiaryResponse>(this.apiUrl, { params });
  }
}
