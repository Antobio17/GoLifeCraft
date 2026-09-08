import { PantryLocationItemKind } from "./pantry-location-item-kind.model";

export interface PantryLocationCandidateAttributes {
  kind: PantryLocationItemKind;
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  unit: string;
  quantity: number;
}
