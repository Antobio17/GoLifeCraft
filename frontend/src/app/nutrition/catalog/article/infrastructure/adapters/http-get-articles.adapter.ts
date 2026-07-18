import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  GetArticlesFilters,
  GetArticlesPort,
} from "../../domain/ports/get-articles.port";
import { GetArticlesResponse } from "../../domain/models/get-articles-response.model";

@Injectable()
export class HttpGetArticlesAdapter extends GetArticlesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/articles";

  getArticles(
    page: number = 1,
    pageSize: number = 20,
    filters: GetArticlesFilters = {},
  ): Observable<GetArticlesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filters.name) {
      params = params.set("filter[name]", filters.name);
    }

    if (filters.category) {
      params = params.set("filter[category]", filters.category);
    }

    if (filters.brand) {
      params = params.set("filter[brand]", filters.brand);
    }

    if (filters.store) {
      params = params.set("filter[store]", filters.store);
    }

    return this.http.get<GetArticlesResponse>(this.apiUrl, { params });
  }
}
