export interface UpdateGlobalArticleRequest {
  name: string;
  brand: string | null;
  categoryName: string | null;
  quantity: string | null;
  price: number | null;
  previousPrice: number | null;
  referencePrice: number | null;
  referenceFormat: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  sugars: number | null;
  fat: number | null;
  saturatedFat: number | null;
  fiber: number | null;
  salt: number | null;
}
