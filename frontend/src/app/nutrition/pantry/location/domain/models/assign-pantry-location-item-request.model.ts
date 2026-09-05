import { PantryLocationItemKind } from "./pantry-location-item-kind.model";

export interface AssignPantryLocationItemRequest {
  kind: PantryLocationItemKind;
  refId: string;
}
