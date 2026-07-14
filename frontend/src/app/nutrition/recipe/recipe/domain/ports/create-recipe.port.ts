import { Observable } from "rxjs";
import { CreateRecipeRequest } from "../models/create-recipe.model";

export abstract class CreateRecipePort {
  abstract createRecipe(request: CreateRecipeRequest): Observable<void>;
}
