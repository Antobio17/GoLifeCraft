import { Observable } from "rxjs";
import { GetRecipePort } from "../../domain/ports/get-recipe.port";
import { GetRecipeResponse } from "../../domain/models/get-recipe-response.model";

export class GetRecipeService {
  constructor(private getRecipePort: GetRecipePort) {}

  getRecipe(id: string): Observable<GetRecipeResponse> {
    return this.getRecipePort.getRecipe(id);
  }
}
