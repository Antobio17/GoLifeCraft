import { Observable } from "rxjs";
import { CorrectArticleStockPort } from "../../domain/ports/correct-article-stock.port";
import { StockCorrectionKind } from "../../domain/models/stock-correction-kind.model";

export class CorrectArticleStockService {
  constructor(private correctArticleStockPort: CorrectArticleStockPort) {}

  measured(articleId: string, quantity: number): Observable<void> {
    return this.correctArticleStockPort.correctArticleStock(articleId, {
      kind: StockCorrectionKind.Measured,
      quantity: Math.max(0, quantity),
    });
  }

  delta(articleId: string, quantity: number): Observable<void> {
    return this.correctArticleStockPort.correctArticleStock(articleId, {
      kind: StockCorrectionKind.Delta,
      quantity,
    });
  }

  fraction(articleId: string, fraction: number): Observable<void> {
    return this.correctArticleStockPort.correctArticleStock(articleId, {
      kind: StockCorrectionKind.Fraction,
      quantity: Math.max(0, fraction),
    });
  }
}
