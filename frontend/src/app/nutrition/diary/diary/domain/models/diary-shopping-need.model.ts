export interface DiaryShoppingNeed {
  articleId: string;
  name: string;
  emoji: string;
  image: string | null;
  brand: string | null;
  store: string | null;
  price: number | null;
  quantity: number;
  stockQuantity: number;
  missingQuantity: number;
  baseUnit: string;
  packUnit: string | null;
  packSize: number | null;
  packs: number;
  inShoppingList: boolean;
}
