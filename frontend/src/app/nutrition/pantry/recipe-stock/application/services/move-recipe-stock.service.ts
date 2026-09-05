import { Observable } from "rxjs";
import { MoveRecipeStockPort } from "../../domain/ports/move-recipe-stock.port";
import { MoveRecipeStockRequest } from "../../domain/models/move-recipe-stock-request.model";

export class MoveRecipeStockService {
  constructor(private moveRecipeStockPort: MoveRecipeStockPort) {}

  moveRecipeStock(
    recipeId: string,
    request: MoveRecipeStockRequest,
  ): Observable<void> {
    return this.moveRecipeStockPort.moveRecipeStock(recipeId, request);
  }
}
