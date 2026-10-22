import { Observable } from "rxjs";
import { UpdateGlobalArticleRequest } from "../models/update-global-article-request.model";

export abstract class UpdateGlobalArticlePort {
  abstract updateGlobalArticle(
    globalArticleId: string,
    request: UpdateGlobalArticleRequest,
  ): Observable<void>;
}
