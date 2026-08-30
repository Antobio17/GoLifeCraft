import { Observable } from "rxjs";
import { ServeProductionItemSubRecipeRequest } from "../models/serve-production-item-sub-recipe-request.model";

export abstract class ServeProductionItemSubRecipePort {
  abstract serveProductionItemSubRecipe(
    productionId: string,
    itemId: string,
    subRecipeId: string,
    request: ServeProductionItemSubRecipeRequest,
  ): Observable<void>;
}
