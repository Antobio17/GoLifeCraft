import { PantryLocationAttributes } from "./pantry-location-attributes.model";

export interface PantryLocation {
  id: string;
  type: string;
  attributes: PantryLocationAttributes;
}
