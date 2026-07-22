import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetGlobalArticlesPort } from "../../domain/ports/get-global-articles.port";
import { GetGlobalArticlesResponse } from "../../domain/models/get-global-articles-response.model";

@Injectable()
export class HttpGetGlobalArticlesAdapter extends GetGlobalArticlesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/global-catalog/articles";

  getGlobalArticles(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
    filterSource?: string,
  ): Observable<GetGlobalArticlesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    if (filterSource) {
      params = params.set("filter[source]", filterSource);
    }

    return this.http.get<GetGlobalArticlesResponse>(this.apiUrl, { params });
  }
}
