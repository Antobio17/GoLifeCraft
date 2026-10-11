import { ShoppingItemRow } from "@nutrition/shopping/shopping/application/services/shopping-list-view.service";

export interface ShoppingReceiptGroup {
  key: string;
  label: string;
  subtotalLabel: string;
  lines: ShoppingItemRow[];
}
