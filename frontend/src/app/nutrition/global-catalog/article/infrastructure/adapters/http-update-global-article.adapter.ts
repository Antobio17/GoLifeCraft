import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateGlobalArticlePort } from "../../domain/ports/update-global-article.port";
import { UpdateGlobalArticleRequest } from "../../domain/models/update-global-article-request.model";

@Injectable()
export class HttpUpdateGlobalArticleAdapter extends UpdateGlobalArticlePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/global-catalog/articles";

  updateGlobalArticle(
    globalArticleId: string,
    request: UpdateGlobalArticleRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${globalArticleId}`, request);
  }
}
