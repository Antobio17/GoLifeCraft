export interface ArticleNutritionRequest {
  referenceAmount: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  sugars: number | null;
  fat: number | null;
  saturatedFat: number | null;
  fiber: number | null;
  salt: number | null;
}

export interface CreateArticleRequest {
  name: string;
  recipeUnit: string;
  servingSize: number | null;
  price: number | null;
  brand: string | null;
  emoji: string | null;
  categoryId: string | null;
  supermarketId: string | null;
  nutrition: ArticleNutritionRequest;
}
