import { Observable } from "rxjs";
import { GetArticleResponse } from "../models/get-article-response.model";

export abstract class GetArticlePort {
  abstract getArticle(articleId: string): Observable<GetArticleResponse>;
}
