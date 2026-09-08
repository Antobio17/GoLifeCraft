import { PantryLocationItem } from "./pantry-location-item.model";

export interface PantryLocationItemRow {
  item: PantryLocationItem;
  emoji: string;
  name: string;
  imageUrl: string | null;
  quantityLabel: string;
}
