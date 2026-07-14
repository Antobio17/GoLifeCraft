import { Provider } from "@angular/core";
import { GetRecipePort } from "@nutrition/recipe/recipe/domain/ports/get-recipe.port";
import { HttpGetRecipeAdapter } from "@nutrition/recipe/recipe/infrastructure/adapters/http-get-recipe.adapter";
import { GetRecipeService } from "@nutrition/recipe/recipe/application/services/get-recipe.service";
import { RecipeViewService } from "@nutrition/recipe/recipe/application/services/recipe-view.service";

export class GetRecipeProviders {
  static getProviders(): Provider[] {
    return [
      RecipeViewService,
      { provide: GetRecipePort, useClass: HttpGetRecipeAdapter },
      {
        provide: GetRecipeService,
        useFactory: (port: GetRecipePort) => new GetRecipeService(port),
        deps: [GetRecipePort],
      },
    ];
  }
}
