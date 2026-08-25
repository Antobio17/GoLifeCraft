import { ArticleDraftEquivalence } from "./article-draft-equivalence.model";
import { ArticleDraftNutrition } from "./article-draft-nutrition.model";

export interface ArticleDraft {
  name: string | null;
  brand: string | null;
  emoji: string | null;
  price: number | null;
  categoryId: string | null;
  supermarketId: string | null;
  aisleId: string | null;
  quantity: string | null;
  baseUnit: string;
  recipeUnit: string;
  diaryUnit: string;
  packUnit: string | null;
  equivalences: ArticleDraftEquivalence[];
  nutrition: ArticleDraftNutrition | null;
}
