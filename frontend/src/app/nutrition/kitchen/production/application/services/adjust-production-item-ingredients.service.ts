import { Observable } from "rxjs";
import { AdjustProductionItemIngredientsPort } from "../../domain/ports/adjust-production-item-ingredients.port";
import { ProductionIngredientInput } from "../../domain/models/production-ingredient-input.model";

export class AdjustProductionItemIngredientsService {
  constructor(private port: AdjustProductionItemIngredientsPort) {}

  adjustProductionItemIngredients(
    productionId: string,
    itemId: string,
    ingredients: ProductionIngredientInput[],
  ): Observable<void> {
    return this.port.adjustProductionItemIngredients(productionId, itemId, {
      ingredients,
    });
  }

  restoreProductionItemIngredients(
    productionId: string,
    itemId: string,
  ): Observable<void> {
    return this.port.restoreProductionItemIngredients(productionId, itemId);
  }
}
