import { GetPantryLocationsMeta } from "./get-pantry-locations-meta.model";
import { PantryLocationCandidate } from "./pantry-location-candidate.model";

export interface GetPantryLocationCandidatesResponse {
  meta: GetPantryLocationsMeta;
  data: PantryLocationCandidate[];
}
