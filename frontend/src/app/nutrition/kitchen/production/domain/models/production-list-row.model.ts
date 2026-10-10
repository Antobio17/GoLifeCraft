import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";
import { ProductionListItem } from "./production-list-item.model";

export interface ProductionListRow {
  production: ProductionListItem;
  weekday: string;
  day: string;
  title: string;
  meta: string;
  value: string;
  valueTone: DatedRowTone;
  progress: number | null;
  ariaLabel: string;
}
