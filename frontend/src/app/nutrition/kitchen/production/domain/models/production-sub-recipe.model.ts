export interface ProductionSubRecipe {
  recipeId: string;
  name: string;
  emoji: string;
  image: string | null;
  servings: number;
  inStock: number;
  sourceProductionItemId: string | null;
  lotCode: string | null;
  lotLabel: string;
}
