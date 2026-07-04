import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetSupermarketsPort } from "../../domain/ports/get-supermarkets.port";
import { GetSupermarketsResponse } from "../../domain/models/get-supermarkets-response.model";

@Injectable()
export class HttpGetSupermarketsAdapter extends GetSupermarketsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/supermarkets";

  getSupermarkets(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
  ): Observable<GetSupermarketsResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    return this.http.get<GetSupermarketsResponse>(this.apiUrl, { params });
  }
}
