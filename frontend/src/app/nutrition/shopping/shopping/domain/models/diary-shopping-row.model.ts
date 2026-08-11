export interface DiaryShoppingRow {
  articleId: string;
  name: string;
  emoji: string;
  brand: string | null;
  store: string | null;
  priceLabel: string;
  packLabel: string | null;
  quantity: number;
  baseQuantity: number;
  covered: boolean;
  checked: boolean;
}
