import { DsIconName } from "../../../icon/domain/models/icon.model";

export interface IconOption {
  icon: DsIconName;
  label: string;
  keywords?: string[];
}

export interface IconGroup {
  label: string;
  items: IconOption[];
}
