export interface ShoppingListItemView {
  id: string;
  articleId: string | null;
  custom: boolean;
  name: string;
  emoji: string;
  brand: string | null;
  store: string | null;
  category: string;
  aisle: string | null;
  aislePosition: number | null;
  unitPrice: number | null;
  quantity: number;
  packUnit: string | null;
  packSize: number | null;
  baseUnit: string;
  baseQuantity: number | null;
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
