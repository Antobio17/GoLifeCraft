import { RecipePrepMode } from "./recipe-prep-mode.enum";

export interface RecipeIngredientRequest {
  kind: "product" | "recipe";
  refId: string;
  quantity: number;
  unit: string | null;
  position: number;
}

export interface RecipeStepRequest {
  position: number;
  text: string;
  minutes: number | null;
}

export interface CreateRecipeRequest {
  id: string;
  name: string;
  emoji: string;
  category: string;
  servings: number;
  prepMode: RecipePrepMode;
  ingredients: RecipeIngredientRequest[];
  steps: RecipeStepRequest[];
}
