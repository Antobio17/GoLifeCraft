import { Injectable } from "@angular/core";
import { CookChoiceAmounts } from "../../domain/models/cook-choice-amounts.model";
import { KitchenToCook } from "../../domain/models/kitchen-to-cook.model";

@Injectable()
export class CookChoiceService {
  amounts(item: KitchenToCook): CookChoiceAmounts | null {
    const hint = item.packHint;
    if (!hint) return null;

    return {
      deficitServings: item.deficit,
      suggestedServings: hint.suggestedServings,
      neededQuantity: hint.neededQuantity,
      packQuantity: hint.packQuantity,
      leftoverQuantity: Math.max(0, hint.packQuantity - hint.neededQuantity),
      extraServings: Math.max(0, hint.suggestedServings - item.deficit),
      unit: hint.unit,
    };
  }
}
