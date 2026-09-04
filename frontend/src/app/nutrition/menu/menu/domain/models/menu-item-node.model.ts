import { MenuItemKind, MenuMacros } from "./menu.model";

export interface MenuItemNodeView {
  path: string;
  kind: MenuItemKind;
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  quantity: number;
  unit: string;
  macros: MenuMacros;
  children: MenuItemNodeView[];
}
