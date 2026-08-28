import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetProductionsPort } from "../../domain/ports/get-productions.port";
import { GetProductionsResponse } from "../../domain/models/get-productions-response.model";

@Injectable()
export class HttpGetProductionsAdapter extends GetProductionsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  getProductions(
    page: number,
    pageSize: number,
  ): Observable<GetProductionsResponse> {
    const params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    return this.http.get<GetProductionsResponse>(this.apiUrl, { params });
  }
}
