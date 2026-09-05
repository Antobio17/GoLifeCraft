import { GetPantryLocationsMeta } from "./get-pantry-locations-meta.model";
import { PantryLocation } from "./pantry-location.model";

export interface GetPantryLocationsResponse {
  meta: GetPantryLocationsMeta;
  data: PantryLocation[];
}
