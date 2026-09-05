import { PantryLocationItemKind } from "./pantry-location-item-kind.model";

export interface PantryLocationItemAttributes {
  kind: PantryLocationItemKind;
  refId: string;
  name: string;
  emoji: string;
  unit: string;
  quantity: number;
}
