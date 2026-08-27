import { Observable } from "rxjs";
import { UpdateRecipeStockPort } from "../../domain/ports/update-recipe-stock.port";
import { UpdateRecipeStockRequest } from "../../domain/models/update-recipe-stock-request.model";

export class UpdateRecipeStockService {
  constructor(private updateRecipeStockPort: UpdateRecipeStockPort) {}

  updateRecipeStock(
    recipeId: string,
    request: UpdateRecipeStockRequest,
  ): Observable<void> {
    return this.updateRecipeStockPort.updateRecipeStock(recipeId, request);
  }
}
