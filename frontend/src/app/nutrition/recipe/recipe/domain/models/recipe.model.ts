export interface RecipeMacros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface RecipeIngredientView {
  id: string;
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
  position: number;
  macros: RecipeMacros;
}

export interface RecipeListAttributes {
  name: string;
  emoji: string;
  category: string;
  servings: number;
  ingredientCount: number;
  hasSubRecipe: boolean;
  total: RecipeMacros;
  perServing: RecipeMacros;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeDetailAttributes {
  name: string;
  emoji: string;
  category: string;
  servings: number;
  ingredients: RecipeIngredientView[];
  total: RecipeMacros;
  perServing: RecipeMacros;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeListItem {
  id: string;
  type: string;
  attributes: RecipeListAttributes;
}

export interface RecipeDetail {
  id: string;
  type: string;
  attributes: RecipeDetailAttributes;
}
