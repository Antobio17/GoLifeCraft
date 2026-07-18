import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ImportGlobalArticlePort } from "../../domain/ports/import-global-article.port";

@Injectable()
export class HttpImportGlobalArticleAdapter extends ImportGlobalArticlePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article/import";

  importGlobalArticle(globalArticleId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${globalArticleId}`, {});
  }
}
