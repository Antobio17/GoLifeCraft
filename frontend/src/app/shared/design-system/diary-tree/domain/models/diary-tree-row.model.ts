import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";
import { SelectOption } from "../../../select/domain/models/select-option.model";

export interface DiaryTreeRow {
  path: string;
  depth: number;
  recipe: boolean;
  emoji: string;
  name: string;
  kcalLabel: string;
  macros: MacroBadge[];
  quantity: number;
  unit: string;
  unitLabel: string;
  unitOptions: SelectOption[];
  expandable: boolean;
  expanded: boolean;
  lotPickable?: boolean;
  lotLabel?: string;
}
