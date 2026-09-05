import { Observable } from "rxjs";
import { MoveArticleStockRequest } from "../models/move-article-stock-request.model";

export abstract class MoveArticleStockPort {
  abstract moveArticleStock(
    articleId: string,
    request: MoveArticleStockRequest,
  ): Observable<void>;
}
