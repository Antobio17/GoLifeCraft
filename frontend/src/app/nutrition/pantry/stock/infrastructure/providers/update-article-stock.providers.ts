import { Provider } from "@angular/core";
import { UpdateArticleStockPort } from "@nutrition/pantry/stock/domain/ports/update-article-stock.port";
import { HttpUpdateArticleStockAdapter } from "@nutrition/pantry/stock/infrastructure/adapters/http-update-article-stock.adapter";
import { UpdateArticleStockService } from "@nutrition/pantry/stock/application/services/update-article-stock.service";
import { StockViewService } from "@nutrition/pantry/stock/application/services/stock-view.service";

export class UpdateArticleStockProviders {
  static getProviders(): Provider[] {
    return [
      StockViewService,
      {
        provide: UpdateArticleStockPort,
        useClass: HttpUpdateArticleStockAdapter,
      },
      {
        provide: UpdateArticleStockService,
        useFactory: (port: UpdateArticleStockPort) =>
          new UpdateArticleStockService(port),
        deps: [UpdateArticleStockPort],
      },
    ];
  }
}
