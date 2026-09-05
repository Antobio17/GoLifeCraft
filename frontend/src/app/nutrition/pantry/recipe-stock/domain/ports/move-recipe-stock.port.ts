import { Observable } from "rxjs";
import { MoveRecipeStockRequest } from "../models/move-recipe-stock-request.model";

export abstract class MoveRecipeStockPort {
  abstract moveRecipeStock(
    recipeId: string,
    request: MoveRecipeStockRequest,
  ): Observable<void>;
}
