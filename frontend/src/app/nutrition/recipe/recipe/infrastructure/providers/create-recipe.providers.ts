import { Provider } from "@angular/core";
import { CreateRecipePort } from "@nutrition/recipe/recipe/domain/ports/create-recipe.port";
import { HttpCreateRecipeAdapter } from "@nutrition/recipe/recipe/infrastructure/adapters/http-create-recipe.adapter";
import { CreateRecipeService } from "@nutrition/recipe/recipe/application/services/create-recipe.service";

export class CreateRecipeProviders {
  static getProviders(): Provider[] {
    return [
      { provide: CreateRecipePort, useClass: HttpCreateRecipeAdapter },
      {
        provide: CreateRecipeService,
        useFactory: (port: CreateRecipePort) => new CreateRecipeService(port),
        deps: [CreateRecipePort],
      },
    ];
  }
}
