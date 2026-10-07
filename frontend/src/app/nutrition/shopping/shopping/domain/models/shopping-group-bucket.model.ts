import { ShoppingListItemView } from "@nutrition/shopping/shopping/domain/models/shopping-list.model";

export interface ShoppingGroupBucket {
  key: string;
  label: string;
  badge: string | null;
  muted: boolean;
  items: ShoppingListItemView[];
}
