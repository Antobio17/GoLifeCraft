import { Observable } from "rxjs";
import { UpdateRecipeStockPort } from "../../domain/ports/update-recipe-stock.port";

export class UpdateRecipeStockService {
  constructor(private updateRecipeStockPort: UpdateRecipeStockPort) {}

  updateRecipeStock(recipeId: string, servings: number): Observable<void> {
    return this.updateRecipeStockPort.updateRecipeStock(recipeId, servings);
  }
}
