import { Observable } from "rxjs";
import { CorrectArticleStockPort } from "../../domain/ports/correct-article-stock.port";
import { CorrectArticleStockRequest } from "../../domain/models/correct-article-stock-request.model";
import { StockCorrectionKind } from "../../domain/models/stock-correction-kind.model";
import { StockLevel } from "../../domain/models/stock-level.model";

export class CorrectArticleStockService {
  constructor(private correctArticleStockPort: CorrectArticleStockPort) {}

  measured(
    articleId: string,
    quantity: number,
    unit?: string,
  ): Observable<void> {
    return this.correct(articleId, {
      kind: StockCorrectionKind.Measured,
      quantity: Math.max(0, quantity),
      unit,
    });
  }

  delta(articleId: string, quantity: number, unit?: string): Observable<void> {
    return this.correct(articleId, {
      kind: StockCorrectionKind.Delta,
      quantity,
      unit,
    });
  }

  fraction(articleId: string, fraction: number): Observable<void> {
    return this.correct(articleId, {
      kind: StockCorrectionKind.Fraction,
      quantity: Math.max(0, fraction),
    });
  }

  level(articleId: string, level: StockLevel): Observable<void> {
    return this.correct(articleId, {
      kind: StockCorrectionKind.Level,
      level,
    });
  }

  correct(
    articleId: string,
    request: CorrectArticleStockRequest,
  ): Observable<void> {
    return this.correctArticleStockPort.correctArticleStock(articleId, request);
  }
}
