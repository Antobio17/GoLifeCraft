import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteArticlePort } from "../../domain/ports/delete-article.port";

@Injectable()
export class HttpDeleteArticleAdapter extends DeleteArticlePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article";

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "/" + id);
  }
}
