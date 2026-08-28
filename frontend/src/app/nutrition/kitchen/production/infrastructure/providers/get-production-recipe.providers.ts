import { Provider } from "@angular/core";
import { GetProductionRecipePort } from "@nutrition/kitchen/production/domain/ports/get-production-recipe.port";
import { HttpGetProductionRecipeAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-get-production-recipe.adapter";
import { GetProductionRecipeService } from "@nutrition/kitchen/production/application/services/get-production-recipe.service";

export class GetProductionRecipeProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetProductionRecipePort,
        useClass: HttpGetProductionRecipeAdapter,
      },
      {
        provide: GetProductionRecipeService,
        useFactory: (port: GetProductionRecipePort) =>
          new GetProductionRecipeService(port),
        deps: [GetProductionRecipePort],
      },
    ];
  }
}
