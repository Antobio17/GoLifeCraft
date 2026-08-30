import { Provider } from "@angular/core";
import { ServeProductionItemSubRecipePort } from "@nutrition/kitchen/production/domain/ports/serve-production-item-sub-recipe.port";
import { HttpServeProductionItemSubRecipeAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-serve-production-item-sub-recipe.adapter";
import { ServeProductionItemSubRecipeService } from "@nutrition/kitchen/production/application/services/serve-production-item-sub-recipe.service";

export class ServeProductionItemSubRecipeProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ServeProductionItemSubRecipePort,
        useClass: HttpServeProductionItemSubRecipeAdapter,
      },
      {
        provide: ServeProductionItemSubRecipeService,
        useFactory: (port: ServeProductionItemSubRecipePort) =>
          new ServeProductionItemSubRecipeService(port),
        deps: [ServeProductionItemSubRecipePort],
      },
    ];
  }
}
