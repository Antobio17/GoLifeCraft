import { Observable } from "rxjs";
import { AdjustProductionItemIngredientsRequest } from "../models/adjust-production-item-ingredients-request.model";

export abstract class AdjustProductionItemIngredientsPort {
  abstract adjustProductionItemIngredients(
    productionId: string,
    itemId: string,
    request: AdjustProductionItemIngredientsRequest,
  ): Observable<void>;

  abstract restoreProductionItemIngredients(
    productionId: string,
    itemId: string,
  ): Observable<void>;
}
