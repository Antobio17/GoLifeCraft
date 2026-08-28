import { Provider } from "@angular/core";
import { UpdateRecipeStockPort } from "@nutrition/pantry/recipe-stock/domain/ports/update-recipe-stock.port";
import { HttpUpdateRecipeStockAdapter } from "@nutrition/pantry/recipe-stock/infrastructure/adapters/http-update-recipe-stock.adapter";
import { UpdateRecipeStockService } from "@nutrition/pantry/recipe-stock/application/services/update-recipe-stock.service";

export class UpdateRecipeStockProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateRecipeStockPort,
        useClass: HttpUpdateRecipeStockAdapter,
      },
      {
        provide: UpdateRecipeStockService,
        useFactory: (port: UpdateRecipeStockPort) =>
          new UpdateRecipeStockService(port),
        deps: [UpdateRecipeStockPort],
      },
    ];
  }
}
