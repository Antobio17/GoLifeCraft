import { MenuItemKind, MenuMacros } from "./menu.model";

export interface MenuItemNodeView {
  path: string;
  kind: MenuItemKind;
  refId: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
  macros: MenuMacros;
  children: MenuItemNodeView[];
}
