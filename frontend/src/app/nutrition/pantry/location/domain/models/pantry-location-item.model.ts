import { PantryLocationItemAttributes } from "./pantry-location-item-attributes.model";

export interface PantryLocationItem {
  id: string;
  type: string;
  attributes: PantryLocationItemAttributes;
}
