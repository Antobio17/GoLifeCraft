import { Observable } from "rxjs";

export abstract class UpdateRecipeStockPort {
  abstract updateRecipeStock(
    recipeId: string,
    servings: number,
  ): Observable<void>;
}
