import { Provider } from "@angular/core";
import { UpdateRecipeStockPort } from "@nutrition/kitchen/production/domain/ports/update-recipe-stock.port";
import { HttpUpdateRecipeStockAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-update-recipe-stock.adapter";
import { UpdateRecipeStockService } from "@nutrition/kitchen/production/application/services/update-recipe-stock.service";

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
