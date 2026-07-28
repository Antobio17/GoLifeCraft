import {
  MenuItemKind,
  MenuMealKey,
  MenuType,
  MenuWeekDayKey,
} from "./menu.model";

export interface MenuItemRequest {
  dayKey: MenuWeekDayKey | null;
  meal: MenuMealKey;
  kind: MenuItemKind;
  refId: string;
  quantity: number;
  unit: string | null;
  position: number;
}

export interface CreateMenuRequest {
  name: string;
  emoji: string;
  note: string;
  type: MenuType;
  items: MenuItemRequest[];
}

export interface UpdateMenuRequest {
  name: string;
  emoji: string;
  note: string;
  items: MenuItemRequest[];
}

export interface DuplicateMenuRequest {
  copySuffix: string;
}

export interface LoadMenuRequest {
  fromDate: string;
  toDate: string;
  dayKey: MenuWeekDayKey | null;
}

export interface ApplyWeekMenuRequest {
  weekStartDate: string;
}
