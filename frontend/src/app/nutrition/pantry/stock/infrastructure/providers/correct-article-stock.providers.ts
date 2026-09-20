import { Provider } from "@angular/core";
import { CorrectArticleStockPort } from "../../domain/ports/correct-article-stock.port";
import { CorrectArticleStockService } from "../../application/services/correct-article-stock.service";
import { HttpCorrectArticleStockAdapter } from "../adapters/http-correct-article-stock.adapter";
import { StockViewService } from "../../application/services/stock-view.service";

export class CorrectArticleStockProviders {
  static getProviders(): Provider[] {
    return [
      StockViewService,
      {
        provide: CorrectArticleStockPort,
        useClass: HttpCorrectArticleStockAdapter,
      },
      {
        provide: CorrectArticleStockService,
        useFactory: (port: CorrectArticleStockPort) =>
          new CorrectArticleStockService(port),
        deps: [CorrectArticleStockPort],
      },
    ];
  }
}
