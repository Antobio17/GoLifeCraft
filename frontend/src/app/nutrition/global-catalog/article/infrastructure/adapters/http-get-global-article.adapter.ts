import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetGlobalArticlePort } from "../../domain/ports/get-global-article.port";
import { GetGlobalArticleResponse } from "../../domain/models/get-global-article-response.model";

@Injectable()
export class HttpGetGlobalArticleAdapter extends GetGlobalArticlePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/global-catalog/articles";

  getGlobalArticle(
    globalArticleId: string,
  ): Observable<GetGlobalArticleResponse> {
    return this.http.get<GetGlobalArticleResponse>(
      `${this.apiUrl}/${globalArticleId}`,
    );
  }
}
