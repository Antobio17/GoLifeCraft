import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetSessionsPort } from "../../domain/ports/get-sessions.port";
import { GetSessionsResponse } from "../../domain/models/get-sessions-response.model";

@Injectable()
export class HttpGetSessionsAdapter extends GetSessionsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/sessions";

  getSessions(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
  ): Observable<GetSessionsResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    return this.http.get<GetSessionsResponse>(this.apiUrl, { params });
  }
}
