import { Observable } from "rxjs";
import { UpdateArticleStockPort } from "../../domain/ports/update-article-stock.port";

export class UpdateArticleStockService {
  constructor(private updateArticleStockPort: UpdateArticleStockPort) {}

  updateArticleStock(articleId: string, quantity: number): Observable<void> {
    return this.updateArticleStockPort.updateArticleStock(
      articleId,
      Math.max(0, quantity),
    );
  }
}
