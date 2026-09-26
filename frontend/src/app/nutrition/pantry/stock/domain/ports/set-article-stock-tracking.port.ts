import { Observable } from "rxjs";
import { StockTrackingMode } from "../models/stock-tracking-mode.model";

export abstract class SetArticleStockTrackingPort {
  abstract setArticleStockTracking(
    articleId: string,
    trackingMode: StockTrackingMode,
  ): Observable<void>;
}
