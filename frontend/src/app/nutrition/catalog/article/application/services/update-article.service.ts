import { Observable } from "rxjs";
import { UpdateArticlePort } from "../../domain/ports/update-article.port";
import { UpdateArticleRequest } from "../../domain/models/update-article.model";

export class UpdateArticleService {
  constructor(private updateArticlePort: UpdateArticlePort) {}

  updateArticle(id: string, request: UpdateArticleRequest): Observable<void> {
    return this.updateArticlePort.updateArticle(id, request);
  }
}
