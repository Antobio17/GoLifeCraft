import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { InventoryLocationItem } from "./inventory-location-item.model";

export interface InventoryItemRow {
  item: InventoryLocationItem;
  emoji: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unit: string;
  unitLabel: string;
  unitOptions: SelectOption[];
  countedLabel: string;
  counted: boolean;
}
