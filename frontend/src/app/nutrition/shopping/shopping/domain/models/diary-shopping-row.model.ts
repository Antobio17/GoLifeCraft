export interface DiaryShoppingRow {
  articleId: string;
  name: string;
  emoji: string;
  imageUrl: string | null;
  brand: string | null;
  store: string | null;
  priceLabel: string;
  meta: string;
  quantity: number;
  baseQuantity: number;
  covered: boolean;
  unknownFormat: boolean;
  checked: boolean;
}
