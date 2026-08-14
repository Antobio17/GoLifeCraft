import { Observable } from "rxjs";
import { GetGlobalArticlePort } from "../../domain/ports/get-global-article.port";
import { GetGlobalArticleResponse } from "../../domain/models/get-global-article-response.model";

export class GetGlobalArticleService {
  constructor(private getGlobalArticlePort: GetGlobalArticlePort) {}

  getGlobalArticle(
    globalArticleId: string,
  ): Observable<GetGlobalArticleResponse> {
    return this.getGlobalArticlePort.getGlobalArticle(globalArticleId);
  }
}
