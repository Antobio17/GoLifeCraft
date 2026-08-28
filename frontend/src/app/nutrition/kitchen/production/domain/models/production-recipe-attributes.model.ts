import { ProductionIngredient } from "./production-ingredient.model";
import { ProductionItemStatus } from "./production-item-status.model";
import { ProductionStatus } from "./production-status.model";
import { ProductionStep } from "./production-step.model";
import { ProductionSubRecipe } from "./production-sub-recipe.model";

export interface ProductionRecipeAttributes {
  productionId: string;
  recipeId: string;
  name: string;
  emoji: string;
  status: ProductionItemStatus;
  productionStatus: ProductionStatus;
  servingsPlanned: number;
  servingsCooked: number;
  recipeServings: number;
  checkedArticleIds: string[];
  ingredients: ProductionIngredient[];
  subRecipes: ProductionSubRecipe[];
  steps: ProductionStep[];
}
