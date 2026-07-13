import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateArticlePort } from "../../domain/ports/create-article.port";
import { CreateArticleRequest } from "../../domain/models/create-article.model";

@Injectable()
export class HttpCreateArticleAdapter extends CreateArticlePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article";

  createArticle(request: CreateArticleRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
