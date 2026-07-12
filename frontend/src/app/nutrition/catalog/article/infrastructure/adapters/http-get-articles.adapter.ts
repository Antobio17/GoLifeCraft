import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetArticlesPort } from "../../domain/ports/get-articles.port";
import { GetArticlesResponse } from "../../domain/models/get-articles-response.model";

@Injectable()
export class HttpGetArticlesAdapter extends GetArticlesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/articles";

  getArticles(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
  ): Observable<GetArticlesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    return this.http.get<GetArticlesResponse>(this.apiUrl, { params });
  }
}
