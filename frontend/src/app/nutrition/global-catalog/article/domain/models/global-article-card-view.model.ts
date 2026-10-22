export interface GlobalArticleCardView {
  id: string;
  emoji: string;
  imageUrl: string | null;
  name: string;
  price: string | null;
  brand: string | null;
  source: string | null;
  kcal: string | null;
  protein: string | null;
  fat: string | null;
  carbs: string | null;
  imported: boolean;
}
