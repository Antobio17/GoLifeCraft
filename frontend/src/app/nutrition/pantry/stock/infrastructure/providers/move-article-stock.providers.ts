import { Provider } from "@angular/core";
import { MoveArticleStockPort } from "@nutrition/pantry/stock/domain/ports/move-article-stock.port";
import { HttpMoveArticleStockAdapter } from "@nutrition/pantry/stock/infrastructure/adapters/http-move-article-stock.adapter";
import { MoveArticleStockService } from "@nutrition/pantry/stock/application/services/move-article-stock.service";

export class MoveArticleStockProviders {
  static getProviders(): Provider[] {
    return [
      { provide: MoveArticleStockPort, useClass: HttpMoveArticleStockAdapter },
      {
        provide: MoveArticleStockService,
        useFactory: (port: MoveArticleStockPort) =>
          new MoveArticleStockService(port),
        deps: [MoveArticleStockPort],
      },
    ];
  }
}
