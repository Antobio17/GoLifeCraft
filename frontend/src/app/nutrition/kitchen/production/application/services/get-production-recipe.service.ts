import { Observable } from "rxjs";
import { GetProductionRecipePort } from "../../domain/ports/get-production-recipe.port";
import { GetProductionRecipeResponse } from "../../domain/models/get-production-recipe-response.model";

export class GetProductionRecipeService {
  constructor(private getProductionRecipePort: GetProductionRecipePort) {}

  getProductionRecipe(
    productionId: string,
    itemId: string,
  ): Observable<GetProductionRecipeResponse> {
    return this.getProductionRecipePort.getProductionRecipe(
      productionId,
      itemId,
    );
  }
}
