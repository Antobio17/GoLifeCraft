import { PantryLocationItemKind } from "./pantry-location-item-kind.model";

export interface PantryLocationCandidateAttributes {
  kind: PantryLocationItemKind;
  refId: string;
  name: string;
  emoji: string;
  unit: string;
  quantity: number;
  locationId: string | null;
  locationName: string | null;
}
