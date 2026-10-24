export interface GlobalArticleCardView {
  id: string;
  emoji: string;
  imageUrl: string | null;
  name: string;
  price: string | null;
  brand: string | null;
  source: string | null;
  kcal: string | null;
  proteinG: number;
  fatG: number;
  carbsG: number;
  macroLabel: string;
  imported: boolean;
}
