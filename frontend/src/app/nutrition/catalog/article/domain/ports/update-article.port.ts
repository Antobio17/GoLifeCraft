import { Observable } from "rxjs";
import { UpdateArticleRequest } from "../models/update-article.model";

export abstract class UpdateArticlePort {
  abstract updateArticle(
    id: string,
    request: UpdateArticleRequest,
  ): Observable<void>;
}
