import { ProductionIngredient } from "./production-ingredient.model";
import { ProductionStatus } from "./production-status.model";
import { ProductionStep } from "./production-step.model";

export interface ProductionDetail {
  id: string;
  recipeId: string;
  name: string;
  emoji: string;
  cookDate: string;
  status: ProductionStatus;
  servingsCooked: number;
  recipeServings: number;
  ingredients: ProductionIngredient[];
  steps: ProductionStep[];
}
