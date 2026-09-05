import { Observable } from "rxjs";
import { MoveArticleStockPort } from "../../domain/ports/move-article-stock.port";
import { MoveArticleStockRequest } from "../../domain/models/move-article-stock-request.model";

export class MoveArticleStockService {
  constructor(private moveArticleStockPort: MoveArticleStockPort) {}

  moveArticleStock(
    articleId: string,
    request: MoveArticleStockRequest,
  ): Observable<void> {
    return this.moveArticleStockPort.moveArticleStock(articleId, request);
  }
}
