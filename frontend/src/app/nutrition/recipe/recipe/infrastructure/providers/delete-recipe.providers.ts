import { Provider } from "@angular/core";
import { DeleteRecipePort } from "@nutrition/recipe/recipe/domain/ports/delete-recipe.port";
import { HttpDeleteRecipeAdapter } from "@nutrition/recipe/recipe/infrastructure/adapters/http-delete-recipe.adapter";
import { DeleteRecipeService } from "@nutrition/recipe/recipe/application/services/delete-recipe.service";

export class DeleteRecipeProviders {
  static getProviders(): Provider[] {
    return [
      { provide: DeleteRecipePort, useClass: HttpDeleteRecipeAdapter },
      {
        provide: DeleteRecipeService,
        useFactory: (port: DeleteRecipePort) => new DeleteRecipeService(port),
        deps: [DeleteRecipePort],
      },
    ];
  }
}
