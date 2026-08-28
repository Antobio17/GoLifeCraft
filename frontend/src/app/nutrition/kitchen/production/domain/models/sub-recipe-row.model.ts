import { ProductionSubRecipe } from "./production-sub-recipe.model";

export interface SubRecipeRow {
  item: ProductionSubRecipe;
  meta: string;
  short: boolean;
  checked: boolean;
}
