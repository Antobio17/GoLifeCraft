import { MenuItemNodeView } from "./menu-item-node.model";

export type MenuType = "single" | "week";

export type MenuItemKind = "product" | "recipe";

export type MenuMealKey = "breakfast" | "lunch" | "dinner" | "snack";

export type MenuWeekDayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export interface MenuMacros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MenuItemView {
  id: string;
  dayKey: MenuWeekDayKey | null;
  meal: MenuMealKey;
  kind: MenuItemKind;
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  quantity: number;
  unit: string | null;
  baseUnit: string;
  position: number;
  macros: MenuMacros;
  customized: boolean;
  tree: MenuItemNodeView[];
}

export interface MenuMealView {
  key: MenuMealKey;
  items: MenuItemView[];
  itemCount: number;
  totals: MenuMacros;
}

export interface MenuDayView {
  dayKey: MenuWeekDayKey | null;
  meals: MenuMealView[];
  itemCount: number;
  totals: MenuMacros;
}

export interface MenuListAttributes {
  name: string;
  emoji: string;
  note: string;
  type: MenuType;
  weekDays: MenuWeekDayKey[];
  dayCount: number;
  itemCount: number;
  total: MenuMacros;
  perDay: MenuMacros;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuDetailAttributes {
  name: string;
  emoji: string;
  note: string;
  type: MenuType;
  weekDays: MenuWeekDayKey[];
  days: MenuDayView[];
  itemCount: number;
  total: MenuMacros;
  perDay: MenuMacros;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuListItem {
  id: string;
  type: string;
  attributes: MenuListAttributes;
}

export interface MenuDetail {
  id: string;
  type: string;
  attributes: MenuDetailAttributes;
}
