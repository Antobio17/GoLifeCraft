import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

export interface ViewSwitchOption {
  value: string;
  label: string;
  icon?: DsIconName;
}
