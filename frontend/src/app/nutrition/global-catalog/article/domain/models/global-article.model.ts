export interface GlobalArticleAttributes {
  barcode: string;
  name: string;
  brand: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  quantity: string | null;
  stores: string | null;
  price: number | null;
  source: string;
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

export interface GlobalArticle {
  id: string;
  type: string;
  attributes: GlobalArticleAttributes;
}
