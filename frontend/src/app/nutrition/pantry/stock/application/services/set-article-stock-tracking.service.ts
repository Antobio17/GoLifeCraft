import { Observable } from "rxjs";
import { SetArticleStockTrackingPort } from "../../domain/ports/set-article-stock-tracking.port";
import { StockTrackingMode } from "../../domain/models/stock-tracking-mode.model";

export class SetArticleStockTrackingService {
  constructor(
    private setArticleStockTrackingPort: SetArticleStockTrackingPort,
  ) {}

  setArticleStockTracking(
    articleId: string,
    trackingMode: StockTrackingMode,
    referenceQuantity?: number,
  ): Observable<void> {
    return this.setArticleStockTrackingPort.setArticleStockTracking(
      articleId,
      trackingMode,
      referenceQuantity,
    );
  }
}
