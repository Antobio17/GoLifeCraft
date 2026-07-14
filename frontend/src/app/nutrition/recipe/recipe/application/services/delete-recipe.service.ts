import { Observable } from "rxjs";
import { DeleteRecipePort } from "../../domain/ports/delete-recipe.port";

export class DeleteRecipeService {
  constructor(private deleteRecipePort: DeleteRecipePort) {}

  deleteRecipe(id: string): Observable<void> {
    return this.deleteRecipePort.deleteRecipe(id);
  }
}
