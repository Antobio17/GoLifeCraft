import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

export interface ChoiceModalOption {
  value: string;
  title: string;
  description: string;
  icon?: DsIconName;
  emoji?: string;
}
