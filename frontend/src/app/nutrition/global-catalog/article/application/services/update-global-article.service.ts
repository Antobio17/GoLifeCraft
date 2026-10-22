import { Observable } from "rxjs";
import { UpdateGlobalArticlePort } from "../../domain/ports/update-global-article.port";
import { UpdateGlobalArticleRequest } from "../../domain/models/update-global-article-request.model";

export class UpdateGlobalArticleService {
  constructor(private updateGlobalArticlePort: UpdateGlobalArticlePort) {}

  updateGlobalArticle(
    globalArticleId: string,
    request: UpdateGlobalArticleRequest,
  ): Observable<void> {
    return this.updateGlobalArticlePort.updateGlobalArticle(
      globalArticleId,
      request,
    );
  }
}
