import { MenuItemKind, MenuMealKey, MenuWeekDayKey } from "./menu.model";

export interface AddMenuItemRequest {
  dayKey: MenuWeekDayKey | null;
  meal: MenuMealKey;
  kind: MenuItemKind;
  refId: string;
  quantity: number;
  unit: string | null;
}
