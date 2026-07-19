export interface ArticleAttributes {
  name: string;
  recipeUnit: string;
  servingSize: number | null;
  price: number | null;
  brand: string | null;
  emoji: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleNutritionFacts {
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

export interface ArticleRelationshipRef<TAttributes> {
  data: {
    id: string;
    type: string;
    attributes: TAttributes;
  };
}

export interface ArticleRelationships {
  category?: ArticleRelationshipRef<{ name: string }>;
  supermarket?: ArticleRelationshipRef<{ name: string }>;
  nutritionFacts?: ArticleRelationshipRef<ArticleNutritionFacts>;
}

export interface Article {
  id: string;
  type: string;
  attributes: ArticleAttributes;
  relationships?: ArticleRelationships;
}
