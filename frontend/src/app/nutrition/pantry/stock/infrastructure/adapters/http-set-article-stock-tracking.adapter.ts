import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SetArticleStockTrackingPort } from "../../domain/ports/set-article-stock-tracking.port";
import { StockTrackingMode } from "../../domain/models/stock-tracking-mode.model";

@Injectable()
export class HttpSetArticleStockTrackingAdapter extends SetArticleStockTrackingPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/stock";

  setArticleStockTracking(
    articleId: string,
    trackingMode: StockTrackingMode,
    referenceQuantity?: number,
  ): Observable<void> {
    return this.http.put<void>(
      this.apiUrl + "/" + articleId + "/tracking",
      undefined === referenceQuantity
        ? { trackingMode }
        : { trackingMode, referenceQuantity },
    );
  }
}
