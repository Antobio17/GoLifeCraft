import { Observable } from "rxjs";
import { UpdateRecipePort } from "../../domain/ports/update-recipe.port";
import { CreateRecipeRequest } from "../../domain/models/create-recipe.model";

export class UpdateRecipeService {
  constructor(private updateRecipePort: UpdateRecipePort) {}

  updateRecipe(id: string, request: CreateRecipeRequest): Observable<void> {
    return this.updateRecipePort.updateRecipe(id, request);
  }
}
