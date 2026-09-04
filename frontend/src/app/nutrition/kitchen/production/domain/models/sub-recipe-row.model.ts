import { ProductionSubRecipe } from "./production-sub-recipe.model";

export interface SubRecipeRow {
  item: ProductionSubRecipe;
  imageUrl: string | null;
  meta: string;
  short: boolean;
  checked: boolean;
  lotLabel: string;
}
