import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

export interface DrawerNavItem {
  icon: DsIconName;
  labelKey: string;
  route: string;
  href: string;
  activeOptions: { exact: boolean };
  sub: boolean;
  badge: string;
}
