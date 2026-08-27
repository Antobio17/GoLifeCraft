import { Observable } from "rxjs";
import { UpdateRecipeStockRequest } from "../models/update-recipe-stock-request.model";

export abstract class UpdateRecipeStockPort {
  abstract updateRecipeStock(
    recipeId: string,
    request: UpdateRecipeStockRequest,
  ): Observable<void>;
}
