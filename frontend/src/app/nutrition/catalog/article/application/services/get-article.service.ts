import { Observable } from "rxjs";
import { GetArticlePort } from "../../domain/ports/get-article.port";
import { GetArticleResponse } from "../../domain/models/get-article-response.model";

export class GetArticleService {
  constructor(private getArticlePort: GetArticlePort) {}

  getArticle(articleId: string): Observable<GetArticleResponse> {
    return this.getArticlePort.getArticle(articleId);
  }
}
