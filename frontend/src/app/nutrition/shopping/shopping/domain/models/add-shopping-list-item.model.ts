export interface AddShoppingListItemRequest {
  articleId: string | null;
  customName: string | null;
  quantity: number;
  baseQuantity: number | null;
}
