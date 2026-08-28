import { ProductionRecipeAttributes } from "./production-recipe-attributes.model";

export interface ProductionRecipe {
  id: string;
  type: string;
  attributes: ProductionRecipeAttributes;
}
