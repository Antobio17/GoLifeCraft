export interface RecipeIngredientRequest {
  kind: "product" | "recipe";
  refId: string;
  quantity: number;
  unit: string | null;
  position: number;
}

export interface CreateRecipeRequest {
  name: string;
  emoji: string;
  category: string;
  servings: number;
  ingredients: RecipeIngredientRequest[];
}
