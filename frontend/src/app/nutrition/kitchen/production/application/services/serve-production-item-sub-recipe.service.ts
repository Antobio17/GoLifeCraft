import { Observable } from "rxjs";
import { ServeProductionItemSubRecipePort } from "../../domain/ports/serve-production-item-sub-recipe.port";

export class ServeProductionItemSubRecipeService {
  constructor(private port: ServeProductionItemSubRecipePort) {}

  serveProductionItemSubRecipe(
    productionId: string,
    itemId: string,
    subRecipeId: string,
    sourceProductionItemId: string | null,
  ): Observable<void> {
    return this.port.serveProductionItemSubRecipe(
      productionId,
      itemId,
      subRecipeId,
      { sourceProductionItemId },
    );
  }
}
