import { Observable } from "rxjs";
import { CreateRecipePort } from "../../domain/ports/create-recipe.port";
import { CreateRecipeRequest } from "../../domain/models/create-recipe.model";

export class CreateRecipeService {
  constructor(private createRecipePort: CreateRecipePort) {}

  createRecipe(request: CreateRecipeRequest): Observable<void> {
    return this.createRecipePort.createRecipe(request);
  }
}
