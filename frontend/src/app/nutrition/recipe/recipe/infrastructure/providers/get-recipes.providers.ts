import { Provider } from "@angular/core";
import { GetRecipesPort } from "@nutrition/recipe/recipe/domain/ports/get-recipes.port";
import { HttpGetRecipesAdapter } from "@nutrition/recipe/recipe/infrastructure/adapters/http-get-recipes.adapter";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
import { RecipeViewService } from "@nutrition/recipe/recipe/application/services/recipe-view.service";

export class GetRecipesProviders {
  static getProviders(): Provider[] {
    return [
      RecipeViewService,
      { provide: GetRecipesPort, useClass: HttpGetRecipesAdapter },
      {
        provide: GetRecipesService,
        useFactory: (port: GetRecipesPort) => new GetRecipesService(port),
        deps: [GetRecipesPort],
      },
    ];
  }
}
