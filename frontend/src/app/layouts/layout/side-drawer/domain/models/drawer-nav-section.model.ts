import { DrawerNavItem } from "./drawer-nav-item.model";

export interface DrawerNavSection {
  labelKey: string;
  items: DrawerNavItem[];
}
