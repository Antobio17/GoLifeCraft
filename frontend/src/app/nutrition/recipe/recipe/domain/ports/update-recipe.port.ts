import { Observable } from "rxjs";
import { CreateRecipeRequest } from "../models/create-recipe.model";

export abstract class UpdateRecipePort {
  abstract updateRecipe(
    id: string,
    request: CreateRecipeRequest,
  ): Observable<void>;
}
