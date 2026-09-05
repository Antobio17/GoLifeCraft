import { Provider } from "@angular/core";
import { MoveRecipeStockPort } from "@nutrition/pantry/recipe-stock/domain/ports/move-recipe-stock.port";
import { HttpMoveRecipeStockAdapter } from "@nutrition/pantry/recipe-stock/infrastructure/adapters/http-move-recipe-stock.adapter";
import { MoveRecipeStockService } from "@nutrition/pantry/recipe-stock/application/services/move-recipe-stock.service";

export class MoveRecipeStockProviders {
  static getProviders(): Provider[] {
    return [
      { provide: MoveRecipeStockPort, useClass: HttpMoveRecipeStockAdapter },
      {
        provide: MoveRecipeStockService,
        useFactory: (port: MoveRecipeStockPort) =>
          new MoveRecipeStockService(port),
        deps: [MoveRecipeStockPort],
      },
    ];
  }
}
