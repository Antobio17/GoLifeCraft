import { Observable } from "rxjs";
import { CorrectArticleStockRequest } from "../models/correct-article-stock-request.model";

export abstract class CorrectArticleStockPort {
  abstract correctArticleStock(
    articleId: string,
    request: CorrectArticleStockRequest,
  ): Observable<void>;
}
