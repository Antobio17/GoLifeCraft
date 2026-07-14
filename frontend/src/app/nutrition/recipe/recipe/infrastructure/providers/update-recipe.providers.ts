import { Provider } from "@angular/core";
import { UpdateRecipePort } from "@nutrition/recipe/recipe/domain/ports/update-recipe.port";
import { HttpUpdateRecipeAdapter } from "@nutrition/recipe/recipe/infrastructure/adapters/http-update-recipe.adapter";
import { UpdateRecipeService } from "@nutrition/recipe/recipe/application/services/update-recipe.service";

export class UpdateRecipeProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateRecipePort, useClass: HttpUpdateRecipeAdapter },
      {
        provide: UpdateRecipeService,
        useFactory: (port: UpdateRecipePort) => new UpdateRecipeService(port),
        deps: [UpdateRecipePort],
      },
    ];
  }
}
