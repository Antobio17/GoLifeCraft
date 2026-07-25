import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GetGlobalArticleFacetsPort } from "../../domain/ports/get-global-article-facets.port";
import {
  GlobalArticleFacets,
  GlobalArticleFacetsResponse,
} from "../../domain/models/global-article-facets.model";

@Injectable()
export class HttpGetGlobalArticleFacetsAdapter extends GetGlobalArticleFacetsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/global-catalog/article-facets";

  getGlobalArticleFacets(
    filterSource?: string,
  ): Observable<GlobalArticleFacets> {
    let params = new HttpParams();

    if (filterSource) {
      params = params.set("filter[source]", filterSource);
    }

    return this.http
      .get<GlobalArticleFacetsResponse>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }
}
