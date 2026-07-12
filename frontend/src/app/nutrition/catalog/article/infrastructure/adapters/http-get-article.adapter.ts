import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetArticlePort } from "../../domain/ports/get-article.port";
import { GetArticleResponse } from "../../domain/models/get-article-response.model";

@Injectable()
export class HttpGetArticleAdapter extends GetArticlePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article";

  getArticle(articleId: string): Observable<GetArticleResponse> {
    return this.http.get<GetArticleResponse>(`${this.apiUrl}/${articleId}`);
  }
}
