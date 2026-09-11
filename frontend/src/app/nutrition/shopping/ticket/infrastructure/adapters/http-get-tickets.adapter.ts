import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetTicketsPort } from "../../domain/ports/get-tickets.port";
import { GetTicketsResponse } from "../../domain/models/get-tickets-response.model";

@Injectable()
export class HttpGetTicketsAdapter extends GetTicketsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  getTickets(
    page: number,
    pageSize: number,
    filterStatus?: string,
    filterSearch?: string,
  ): Observable<GetTicketsResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterStatus) {
      params = params.set("filter[status]", filterStatus);
    }

    if (filterSearch) {
      params = params.set("filter[search]", filterSearch);
    }

    return this.http.get<GetTicketsResponse>(this.apiUrl, { params });
  }
}
