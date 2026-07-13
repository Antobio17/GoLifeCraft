import { Observable } from "rxjs";
import { CreateArticlePort } from "../../domain/ports/create-article.port";
import { CreateArticleRequest } from "../../domain/models/create-article.model";

export class CreateArticleService {
  constructor(private createArticlePort: CreateArticlePort) {}

  createArticle(request: CreateArticleRequest): Observable<void> {
    return this.createArticlePort.createArticle(request);
  }
}
