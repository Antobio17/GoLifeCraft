import { Observable } from "rxjs";
import { GetGlobalArticleResponse } from "../models/get-global-article-response.model";

export abstract class GetGlobalArticlePort {
  abstract getGlobalArticle(
    globalArticleId: string,
  ): Observable<GetGlobalArticleResponse>;
}
