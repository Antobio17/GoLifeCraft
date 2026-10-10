export interface ArticleListRow {
  id: string;
  emoji: string;
  imageUrl: string | null;
  name: string;
  price: string | null;
  brand: string | null;
  store: string | null;
  kcal: string | null;
  proteinG: number;
  fatG: number;
  carbsG: number;
  macroLabel: string;
  favorite: boolean;
}
