export interface ShoppingListItemView {
  id: string;
  articleId: string;
  name: string;
  emoji: string;
  brand: string | null;
  store: string | null;
  category: string;
  unitPrice: number | null;
  quantity: number;
  checked: boolean;
  lineTotal: number;
}

export interface ShoppingListAttributes {
  items: ShoppingListItemView[];
  stores: string[];
  itemCount: number;
  checkedCount: number;
  totalEstimated: number;
}

export interface ShoppingList {
  id: string;
  type: string;
  attributes: ShoppingListAttributes;
}
