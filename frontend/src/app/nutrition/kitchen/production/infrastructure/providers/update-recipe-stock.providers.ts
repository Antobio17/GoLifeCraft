import { Provider } from "@angular/core";
import { UpdateRecipeStockPort } from "@nutrition/kitchen/production/domain/ports/update-recipe-stock.port";
import { InMemoryUpdateRecipeStockAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/in-memory-update-recipe-stock.adapter";
import { UpdateRecipeStockService } from "@nutrition/kitchen/production/application/services/update-recipe-stock.service";

export class UpdateRecipeStockProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateRecipeStockPort,
        useClass: InMemoryUpdateRecipeStockAdapter,
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
