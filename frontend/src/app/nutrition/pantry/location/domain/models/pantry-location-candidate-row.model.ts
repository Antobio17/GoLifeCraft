import { PantryLocationCandidate } from "./pantry-location-candidate.model";

export interface PantryLocationCandidateRow {
  candidate: PantryLocationCandidate;
  title: string;
  quantityLabel: string;
  placed: boolean;
  placedLabel: string;
  actionLabel: string;
}
