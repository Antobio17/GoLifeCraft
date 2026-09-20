import { Provider } from "@angular/core";
import { SetArticleStockTrackingPort } from "../../domain/ports/set-article-stock-tracking.port";
import { SetArticleStockTrackingService } from "../../application/services/set-article-stock-tracking.service";
import { HttpSetArticleStockTrackingAdapter } from "../adapters/http-set-article-stock-tracking.adapter";

export class SetArticleStockTrackingProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: SetArticleStockTrackingPort,
        useClass: HttpSetArticleStockTrackingAdapter,
      },
      {
        provide: SetArticleStockTrackingService,
        useFactory: (port: SetArticleStockTrackingPort) =>
          new SetArticleStockTrackingService(port),
        deps: [SetArticleStockTrackingPort],
      },
    ];
  }
}
