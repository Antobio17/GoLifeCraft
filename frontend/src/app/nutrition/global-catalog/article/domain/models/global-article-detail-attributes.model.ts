export interface GlobalArticleDetailAttributes {
  barcode: string;
  name: string;
  brand: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  quantity: string | null;
  stores: string | null;
  price: number | null;
  bulkPrice: number | null;
  referencePrice: number | null;
  referenceFormat: string | null;
  previousPrice: number | null;
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
