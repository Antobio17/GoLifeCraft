export interface MenuShoppingNeed {
  articleId: string;
  name: string;
  emoji: string;
  image: string | null;
  brand: string | null;
  store: string | null;
  quantity: number;
  baseUnit: string;
  packUnit: string | null;
  packSize: number | null;
  packs: number;
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
