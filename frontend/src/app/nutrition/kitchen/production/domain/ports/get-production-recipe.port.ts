import { Observable } from "rxjs";
import { GetProductionRecipeResponse } from "../models/get-production-recipe-response.model";

export abstract class GetProductionRecipePort {
  abstract getProductionRecipe(
    productionId: string,
    itemId: string,
  ): Observable<GetProductionRecipeResponse>;
}
