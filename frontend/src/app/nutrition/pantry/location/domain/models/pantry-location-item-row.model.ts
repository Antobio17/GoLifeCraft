import { PantryLocationItem } from "./pantry-location-item.model";

export interface PantryLocationItemRow {
  item: PantryLocationItem;
  emoji: string;
  name: string;
  imageUrl: string | null;
  openable: boolean;
  quantityLabel: string;
}
