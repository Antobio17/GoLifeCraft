import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetGlobalArticlesPort } from "../../domain/ports/get-global-articles.port";
import { GetGlobalArticlesResponse } from "../../domain/models/get-global-articles-response.model";
import { GetGlobalArticlesFilters } from "../../domain/models/get-global-articles-filters.model";

@Injectable()
export class HttpGetGlobalArticlesAdapter extends GetGlobalArticlesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/global-catalog/articles";

  getGlobalArticles(
    page: number,
    pageSize: number,
    filters: GetGlobalArticlesFilters,
  ): Observable<GetGlobalArticlesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filters.name) {
      params = params.set("filter[name]", filters.name);
    }

    if (filters.source) {
      params = params.set("filter[source]", filters.source);
    }

    if (filters.category) {
      params = params.set("filter[category]", filters.category);
    }

    if (filters.withNutrition) {
      params = params.set("filter[withNutrition]", "true");
    }

    if (filters.hideImported) {
      params = params.set("filter[hideImported]", "true");
    }

    if (filters.orderBy) {
      params = params.set("orderBy", filters.orderBy);
    }

    return this.http.get<GetGlobalArticlesResponse>(this.apiUrl, { params });
  }
}
