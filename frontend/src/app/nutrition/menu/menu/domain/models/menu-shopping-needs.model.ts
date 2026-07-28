export interface MenuShoppingNeed {
  articleId: string;
  name: string;
  emoji: string;
  brand: string | null;
  store: string | null;
  quantity: number;
  baseUnit: string;
  inShoppingList: boolean;
}

export interface MenuShoppingNeedsAttributes {
  menuName: string;
  menuEmoji: string;
  needs: MenuShoppingNeed[];
  needCount: number;
}

export interface GetMenuShoppingNeedsResponse {
  data: {
    id: string;
    type: string;
    attributes: MenuShoppingNeedsAttributes;
  };
}
