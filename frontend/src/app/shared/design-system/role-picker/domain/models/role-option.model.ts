import { DsIconName } from "../../../icon/domain/models/icon.model";

export type RoleTone = "brand" | "accent";

export interface RoleOption {
  value: string;
  icon: DsIconName;
  name: string;
  description: string;
  tone: RoleTone;
}
