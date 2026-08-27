import { ProductionIngredient } from "../../domain/models/production-ingredient.model";
import { ProductionStep } from "../../domain/models/production-step.model";

export interface KitchenRecipeSeed {
  id: string;
  name: string;
  emoji: string;
  servings: number;
  ingredients: ProductionIngredient[];
  steps: ProductionStep[];
  packArticleId: string;
  packUnit: string;
  packQuantity: number;
}
