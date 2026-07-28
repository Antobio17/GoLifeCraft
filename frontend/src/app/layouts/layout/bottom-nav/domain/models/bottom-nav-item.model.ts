import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

export interface BottomNavItem {
  route: string;
  icon: DsIconName;
  labelKey: string;
  exact: boolean;
}
