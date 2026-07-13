import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateArticlePort } from "../../domain/ports/update-article.port";
import { UpdateArticleRequest } from "../../domain/models/update-article.model";

@Injectable()
export class HttpUpdateArticleAdapter extends UpdateArticlePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article";

  updateArticle(id: string, request: UpdateArticleRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + id, request);
  }
}
