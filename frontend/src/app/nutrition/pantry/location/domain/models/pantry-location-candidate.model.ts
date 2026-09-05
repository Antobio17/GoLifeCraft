import { PantryLocationCandidateAttributes } from "./pantry-location-candidate-attributes.model";

export interface PantryLocationCandidate {
  id: string;
  type: string;
  attributes: PantryLocationCandidateAttributes;
}
