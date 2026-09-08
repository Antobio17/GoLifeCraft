import { PantryLocationCandidate } from "./pantry-location-candidate.model";

export interface PantryLocationCandidateRow {
  candidate: PantryLocationCandidate;
  emoji: string;
  name: string;
  imageUrl: string | null;
  quantityLabel: string;
}
