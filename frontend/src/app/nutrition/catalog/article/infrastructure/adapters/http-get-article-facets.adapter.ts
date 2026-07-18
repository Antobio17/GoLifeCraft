import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GetArticleFacetsPort } from "../../domain/ports/get-article-facets.port";
import {
  ArticleFacets,
  ArticleFacetsResponse,
} from "../../domain/models/article-facets.model";

@Injectable()
export class HttpGetArticleFacetsAdapter extends GetArticleFacetsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article-facets";

  getArticleFacets(): Observable<ArticleFacets> {
    return this.http
      .get<ArticleFacetsResponse>(this.apiUrl)
      .pipe(map((response) => response.data));
  }
}
